
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeColors } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { Track, TrackReading, DayReadings } from '@/types/TrackData';
import { IconSymbol } from '@/components/IconSymbol';

export default function BrowseScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [readings, setReadings] = useState<TrackReading[]>([]);
  const [groupedReadings, setGroupedReadings] = useState<DayReadings[]>([]);
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Browse screen focused, reloading data');
      loadTracks();
      if (selectedTrack) {
        loadReadings(selectedTrack.id);
      }
    }, [selectedTrack])
  );

  useEffect(() => {
    if (selectedTrack) {
      loadReadings(selectedTrack.id);
    }
  }, [selectedTrack]);

  const loadTracks = async () => {
    console.log('Loading tracks in BrowseScreen...');
    const loadedTracks = await StorageService.getTracks();
    console.log('Loaded tracks:', loadedTracks.length);
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

  const formatDateWithDay = (dateString: string): string => {
    try {
      const [month, day, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      return `${dateString} - ${dayName}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleReadingPress = (reading: TrackReading) => {
    console.log('Reading pressed:', reading.id);
    router.push({
      pathname: '/(tabs)/reading-detail',
      params: { readingId: reading.id },
    });
  };

  const styles = getStyles(colors);

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
                    {formatDateWithDay(dayGroup.date)}
                  </Text>
                  {dayGroup.readings.map((reading, readingIndex) => (
                    <React.Fragment key={readingIndex}>
                      <TouchableOpacity
                        style={styles.readingCard}
                        onPress={() => handleReadingPress(reading)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.readingHeader}>
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
                            ios_icon_name="chevron.right"
                            android_material_icon_name="chevron_right"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View style={styles.readingPreview}>
                          <View style={styles.previewRow}>
                            <Text style={styles.previewLabel}>Left Lane Temp:</Text>
                            <Text style={styles.previewValue}>
                              {reading.leftLane.trackTemp || 'N/A'}°F
                            </Text>
                          </View>
                          <View style={styles.previewRow}>
                            <Text style={styles.previewLabel}>Right Lane Temp:</Text>
                            <Text style={styles.previewValue}>
                              {reading.rightLane.trackTemp || 'N/A'}°F
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
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

function getStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
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
      marginBottom: 12,
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
    readingPreview: {
      gap: 6,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    previewLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    previewValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
