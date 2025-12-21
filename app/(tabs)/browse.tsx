
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { Track, TrackReading, DayReadings } from '@/types/TrackData';
import { IconSymbol } from '@/components/IconSymbol';

export default function BrowseScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [readings, setReadings] = useState<TrackReading[]>([]);
  const [groupedReadings, setGroupedReadings] = useState<DayReadings[]>([]);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      loadReadings(selectedTrack.id);
    }
  }, [selectedTrack]);

  const loadTracks = async () => {
    const loadedTracks = await StorageService.getTracks();
    setTracks(loadedTracks.sort((a, b) => a.name.localeCompare(b.name)));
    if (loadedTracks.length > 0 && !selectedTrack) {
      setSelectedTrack(loadedTracks[0]);
    }
  };

  const loadReadings = async (trackId: string) => {
    const trackReadings = await StorageService.getReadingsByTrack(trackId);
    const sorted = trackReadings.sort((a, b) => b.timestamp - a.timestamp);
    setReadings(sorted);

    const grouped: { [key: string]: TrackReading[] } = {};
    sorted.forEach((reading) => {
      if (!grouped[reading.date]) {
        grouped[reading.date] = [];
      }
      grouped[reading.date].push(reading);
    });

    const groupedArray: DayReadings[] = Object.keys(grouped).map((date) => ({
      date,
      readings: grouped[date],
    }));

    setGroupedReadings(groupedArray);
  };

  const renderLaneData = (lane: any, title: string) => (
    <View style={styles.laneData}>
      <Text style={styles.laneDataTitle}>{title}</Text>
      <View style={styles.dataGrid}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Track Temp:</Text>
          <Text style={styles.dataValue}>
            {lane.trackTemp || 'N/A'}°F
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>UV Index:</Text>
          <Text style={styles.dataValue}>
            {lane.uvIndex || 'N/A'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Keg SL:</Text>
          <Text style={styles.dataValue}>
            {lane.kegSL || 'N/A'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Keg Out:</Text>
          <Text style={styles.dataValue}>
            {lane.kegOut || 'N/A'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Grippo SL:</Text>
          <Text style={styles.dataValue}>
            {lane.grippoSL || 'N/A'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Grippo Out:</Text>
          <Text style={styles.dataValue}>
            {lane.grippoOut || 'N/A'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Shine:</Text>
          <Text style={styles.dataValue}>
            {lane.shine || 'N/A'}
          </Text>
        </View>
        {lane.notes && (
          <View style={styles.notesRow}>
            <Text style={styles.dataLabel}>Notes:</Text>
            <Text style={styles.notesValue}>
              {lane.notes}
            </Text>
          </View>
        )}
        {lane.imageUri && (
          <Image source={{ uri: lane.imageUri }} style={styles.laneImage} />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Browse Data</Text>

        <View style={styles.trackSelector}>
          <Text style={styles.label}>Select Track</Text>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => setShowTrackPicker(!showTrackPicker)}
          >
            <Text style={styles.trackButtonText}>
              {selectedTrack ? selectedTrack.name : 'Choose a track...'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name={showTrackPicker ? 'expand_less' : 'expand_more'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showTrackPicker && (
            <View style={styles.trackList}>
              {tracks.map((track, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.trackOption,
                      selectedTrack?.id === track.id && styles.trackOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedTrack(track);
                      setShowTrackPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.trackOptionText,
                        selectedTrack?.id === track.id && styles.trackOptionTextSelected,
                      ]}
                    >
                      {track.name}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {readings.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              No readings yet for this track.{'\n'}Start recording data to see it here!
            </Text>
          </View>
        ) : (
          <View style={styles.readingsList}>
            {groupedReadings.map((dayGroup, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <View style={styles.daySection}>
                  <Text style={styles.dayHeader}>
                    {dayGroup.date}
                  </Text>
                  {dayGroup.readings.map((reading, readingIndex) => (
                    <React.Fragment key={readingIndex}>
                      <View style={styles.readingCard}>
                        <TouchableOpacity
                          style={styles.readingHeader}
                          onPress={() =>
                            setExpandedReading(
                              expandedReading === reading.id ? null : reading.id
                            )
                          }
                        >
                          <View style={styles.readingHeaderLeft}>
                            <IconSymbol
                              ios_icon_name="clock"
                              android_material_icon_name="access_time"
                              size={20}
                              color={colors.primary}
                            />
                            <Text style={styles.readingTime}>
                              {reading.time}
                            </Text>
                          </View>
                          <IconSymbol
                            ios_icon_name="chevron.down"
                            android_material_icon_name={
                              expandedReading === reading.id ? 'expand_less' : 'expand_more'
                            }
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>

                        {expandedReading === reading.id && (
                          <View style={styles.readingDetails}>
                            {renderLaneData(reading.leftLane, 'Left Lane')}
                            {renderLaneData(reading.rightLane, 'Right Lane')}
                          </View>
                        )}
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: colors.text,
  },
  trackSelector: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  trackButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  trackButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  trackList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  trackOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  trackOptionSelected: {
    backgroundColor: colors.primary,
  },
  trackOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  trackOptionTextSelected: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  readingsList: {
    gap: 20,
  },
  daySection: {
    marginBottom: 12,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  readingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  readingDetails: {
    marginTop: 16,
    gap: 16,
  },
  laneData: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  laneDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary,
  },
  dataGrid: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  notesRow: {
    marginTop: 8,
  },
  notesValue: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
    color: colors.text,
  },
  laneImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
  },
});
