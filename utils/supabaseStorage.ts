// utils/supabaseStorage.ts

import { supabase, isSupabaseConfigured } from './supabase';
import { Track, TrackReading, LaneReading } from '@/types/TrackData';

export class SupabaseStorageService {
  // ============================================
  // TRACK-LOCAL DATE/TIME HELPERS (no extra deps)
  // ============================================

  private static safeNumber(value: any): number | null {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private static getTrackDateFromTimestamp(ms: number, timeZone: string): string {
    // returns YYYY-MM-DD
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date(ms));

      const y = parts.find((p) => p.type === 'year')?.value ?? '0000';
      const m = parts.find((p) => p.type === 'month')?.value ?? '00';
      const d = parts.find((p) => p.type === 'day')?.value ?? '00';
      return `${y}-${m}-${d}`;
    } catch {
      // fallback: device-local
      const d = new Date(ms);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  private static getYearFromTrackDate(trackDate: string | undefined, ms: number | null): number | undefined {
    // Prefer trackDate’s year so it matches the “track-local forever” intent
    if (trackDate && trackDate.length >= 4) {
      const y = Number(trackDate.slice(0, 4));
      if (Number.isFinite(y)) return y;
    }
    if (ms !== null) {
      const y = new Date(ms).getFullYear();
      if (Number.isFinite(y)) return y;
    }
    return undefined;
  }

  // ============================================
  // TRACKS
  // ============================================

  static async getAllTracks(): Promise<Track[]> {
    console.log('SupabaseStorageService: Fetching all tracks');

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return [];
    }

    try {
      const { data, error } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        if (error.code === '42P17') {
          console.log('RLS policy error detected - this should be fixed now. Please restart the app.');
        }
        return [];
      }

      console.log('Fetched tracks:', data?.length || 0);

      return (data || []).map((track: any) => ({
        id: track.id,
        name: track.name,
        location: track.location,
        createdAt: new Date(track.created_at).getTime(),
      }));
    } catch (error) {
      console.error('Exception fetching tracks:', error);
      return [];
    }
  }

  static async createTrack(name: string, location: string): Promise<Track | null> {
    console.log('SupabaseStorageService: Creating track:', name, location);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return null;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('tracks')
        .insert({
          name,
          location,
          user_id: userData.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating track:', error);
        return null;
      }

      console.log('Track created successfully:', data.id);

      return {
        id: data.id,
        name: data.name,
        location: data.location,
        createdAt: new Date(data.created_at).getTime(),
      };
    } catch (error) {
      console.error('Exception creating track:', error);
      return null;
    }
  }

  static async deleteTrack(trackId: string): Promise<boolean> {
    console.log('SupabaseStorageService: Deleting track:', trackId);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return false;
    }

    try {
      await supabase.from('readings').delete().eq('track_id', trackId);

      const { error } = await supabase.from('tracks').delete().eq('id', trackId);

      if (error) {
        console.error('Error deleting track:', error);
        return false;
      }

      console.log('Track deleted successfully');
      return true;
    } catch (error) {
      console.error('Exception deleting track:', error);
      return false;
    }
  }

  // ============================================
  // READINGS
  // ============================================

  static async getReadingsForTrack(trackId: string, year?: number): Promise<TrackReading[]> {
    console.log('SupabaseStorageService: Fetching readings for track:', trackId, 'year:', year);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return [];
    }

    try {
      let query = supabase.from('readings').select('*').eq('track_id', trackId).order('timestamp', { ascending: false });

      if (year !== undefined) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching readings:', error);
        return [];
      }

      console.log('Fetched readings:', data?.length || 0);

      return (data || []).map((reading: any) => {
        const ts = this.safeNumber(reading.timestamp);
        const timeZone: string | undefined = reading.time_zone ?? undefined;

        // Prefer DB track_date. Fallback to legacy date. If both missing but timestamp exists, compute.
        const trackDate: string | undefined =
          reading.track_date ?? reading.date ?? (ts !== null ? this.getTrackDateFromTimestamp(ts, timeZone ?? 'UTC') : undefined);

        // Prefer DB year. Else derive from trackDate (preferred) or timestamp.
        const dbYear = this.safeNumber(reading.year);
        const derivedYear = dbYear ?? this.getYearFromTrackDate(trackDate, ts);

        return {
          id: reading.id,
          trackId: reading.track_id,

          // legacy (kept for compatibility / old UI)
          date: reading.date ?? trackDate ?? '',
          time: reading.time ?? '',

          // single source of truth
          timestamp: ts ?? 0,
          year: derivedYear ?? 0,

          session: reading.session ?? undefined,
          pair: reading.pair ?? undefined,
          classCurrentlyRunning: reading.class_currently_running ?? undefined,

          leftLane: reading.left_lane as LaneReading,
          rightLane: reading.right_lane as LaneReading,

          // track-local forever
          timeZone,
          trackDate,
        };
      });
    } catch (error) {
      console.error('Exception fetching readings:', error);
      return [];
    }
  }

  static async createReading(reading: Omit<TrackReading, 'id'>): Promise<TrackReading | null> {
    console.log('SupabaseStorageService: Creating reading for track:', reading.trackId);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return null;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      const timestamp = Math.trunc(reading.timestamp); // keep bigint ms clean

      const { data, error } = await supabase
        .from('readings')
        .insert({
          track_id: reading.trackId,

          // legacy columns (kept aligned with track day)
          date: reading.date,
          time: reading.time,

          // source of truth
          timestamp,
          year: reading.year,

          session: reading.session ?? null,
          pair: reading.pair ?? null,

          class_currently_running: reading.classCurrentlyRunning ?? null,
          left_lane: reading.leftLane,
          right_lane: reading.rightLane,

          user_id: userData.user?.id,

          // track-local forever
          time_zone: reading.timeZone ?? null,
          track_date: reading.trackDate ?? null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reading:', error);
        return null;
      }

      console.log('Reading created successfully:', data.id);

      const ts = this.safeNumber(data.timestamp) ?? timestamp;

      return {
        id: data.id,
        trackId: data.track_id,

        date: data.date,
        time: data.time,

        timestamp: ts,
        year: this.safeNumber(data.year) ?? reading.year,

        session: data.session ?? undefined,
        pair: data.pair ?? undefined,
        classCurrentlyRunning: data.class_currently_running ?? undefined,

        leftLane: data.left_lane as LaneReading,
        rightLane: data.right_lane as LaneReading,

        timeZone: data.time_zone ?? undefined,
        trackDate: data.track_date ?? undefined,
      };
    } catch (error) {
      console.error('Exception creating reading:', error);
      return null;
    }
  }

  static async updateReading(readingId: string, updates: Partial<TrackReading>): Promise<boolean> {
    console.log('SupabaseStorageService: Updating reading:', readingId);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return false;
    }

    try {
      const updateData: any = {};

      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.time !== undefined) updateData.time = updates.time;
      if (updates.timestamp !== undefined) updateData.timestamp = Math.trunc(updates.timestamp);
      if (updates.year !== undefined) updateData.year = updates.year;

      if (updates.session !== undefined) updateData.session = updates.session;
      if (updates.pair !== undefined) updateData.pair = updates.pair;

      if (updates.classCurrentlyRunning !== undefined) {
        updateData.class_currently_running = updates.classCurrentlyRunning;
      }
      if (updates.leftLane !== undefined) updateData.left_lane = updates.leftLane;
      if (updates.rightLane !== undefined) updateData.right_lane = updates.rightLane;

      if (updates.timeZone !== undefined) updateData.time_zone = updates.timeZone;
      if (updates.trackDate !== undefined) updateData.track_date = updates.trackDate;

      const { error } = await supabase.from('readings').update(updateData).eq('id', readingId);

      if (error) {
        console.error('Error updating reading:', error);
        return false;
      }

      console.log('Reading updated successfully');
      return true;
    } catch (error) {
      console.error('Exception updating reading:', error);
      return false;
    }
  }

  static async deleteReading(readingId: string): Promise<boolean> {
    console.log('SupabaseStorageService: Deleting reading:', readingId);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return false;
    }

    try {
      const { error } = await supabase.from('readings').delete().eq('id', readingId);

      if (error) {
        console.error('Error deleting reading:', error);
        return false;
      }

      console.log('Reading deleted successfully');
      return true;
    } catch (error) {
      console.error('Exception deleting reading:', error);
      return false;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async getAvailableYears(trackId?: string): Promise<number[]> {
    console.log('SupabaseStorageService: Fetching available years for track:', trackId);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return [];
    }

    try {
      let query = supabase.from('readings').select('year');

      if (trackId) {
        query = query.eq('track_id', trackId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching years:', error);
        if (error.code === '42P17') {
          console.log('RLS policy error detected - this should be fixed now. Please restart the app.');
        }
        return [];
      }

      const years = [...new Set((data || []).map((r: any) => Number(r.year)))]
        .filter((y) => Number.isFinite(y))
        .sort((a, b) => b - a);

      console.log('Available years:', years);
      return years;
    } catch (error) {
      console.error('Exception fetching years:', error);
      return [];
    }
  }

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  static async uploadImage(uri: string, trackId: string, lane: 'left' | 'right'): Promise<string | null> {
    console.log('SupabaseStorageService: Uploading image for track:', trackId, 'lane:', lane);

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured');
      return null;
    }

    try {
      console.log('Image stored locally:', uri);
      return uri;
    } catch (error) {
      console.error('Exception uploading image:', error);
      return null;
    }
  }
}
