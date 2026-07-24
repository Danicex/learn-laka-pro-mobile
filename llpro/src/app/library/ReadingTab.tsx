import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'

export interface Page {
  page_number: number;
  text: string;
  audio_url: string[];
  video_url: string[];
}

export interface BookContent {
  book_id: number;
  title: string;
  pages: Page[];
  test?: object;
}

interface ReadingTabProps {
  bookData: BookContent;
  onBack: () => void;
}

const FONT_SIZES = [16, 20, 24, 28, 32];
const THEMES = {
  light: { background: '#ffffff', text: '#1a1a1a' },
  sepia: { background: '#f4ecd8', text: '#3b2f2f' },
  dark: { background: '#1a1a1a', text: '#e8e8e8' },
};

export default function ReadingTab({ bookData, onBack }: ReadingTabProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // default 20
  const [theme, setTheme] = useState<keyof typeof THEMES>('light');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);

  const page = bookData.pages[pageIndex];
  const currentTheme = THEMES[theme];
  const fontSize = FONT_SIZES[fontSizeIndex];

  const currentAudioUri = page.audio_url?.[audioIndex] ?? null;

  // expo-audio: create the player once; swap its source with .replace() when the uri changes
  const player = useAudioPlayer(currentAudioUri ?? undefined);
  const status = useAudioPlayerStatus(player);

  // reset to first clip whenever the page changes
  useEffect(() => {
    setAudioIndex(0);
  }, [pageIndex]);

  // whenever the target uri changes, load it into the existing player
  useEffect(() => {
    if (currentAudioUri) {
      player.replace(currentAudioUri);
    }
  }, [currentAudioUri]);

  // auto-advance to the next clip in the page's playlist when one finishes
  useEffect(() => {
    if (status.didJustFinish) {
      const audioUrls = page.audio_url ?? [];
      const nextIndex = audioIndex + 1;
      if (nextIndex < audioUrls.length) {
        setAudioIndex(nextIndex);
      }
    }
  }, [status.didJustFinish]);

  // pause playback whenever we leave the screen/page
  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [pageIndex]);

  const togglePlay = () => {
    if (!currentAudioUri) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const goToPage = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= bookData.pages.length) return;
    player.pause();
    setPageIndex(newIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.headerButton, { color: currentTheme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text }]} numberOfLines={1}>
          {bookData.title}
        </Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Text style={[styles.headerButton, { color: currentTheme.text }]}>Aa</Text>
        </TouchableOpacity>
      </View>

      {/* Page content */}
      <ScrollView style={styles.textContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.pageText, { fontSize, color: currentTheme.text }]}>
          {page.text}
        </Text>
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 0}
          style={styles.navButton}
        >
          <Text style={[styles.navButtonText, pageIndex === 0 && styles.disabledText]}>
            ‹ Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playButton} disabled={!currentAudioUri}>
          <Text style={styles.playButtonText}>
            {status.playing ? '⏸ Pause' : '▶ Play'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.pageIndicator, { color: currentTheme.text }]}>
          {pageIndex + 1} / {bookData.pages.length}
        </Text>

        <TouchableOpacity
          onPress={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === bookData.pages.length - 1}
          style={styles.navButton}
        >
          <Text
            style={[
              styles.navButtonText,
              pageIndex === bookData.pages.length - 1 && styles.disabledText,
            ]}
          >
            Next ›
          </Text>
        </TouchableOpacity>
      </View>

      {page.audio_url?.length > 1 && (
        <Text style={[styles.audioProgress, { color: currentTheme.text }]}>
          Audio {audioIndex + 1}/{page.audio_url.length}
        </Text>
      )}

      {/* Text settings modal */}
      <Modal visible={settingsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reading Settings</Text>

            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setFontSizeIndex(Math.max(0, fontSizeIndex - 1))}
                style={styles.settingButton}
              >
                <Text style={styles.settingButtonText}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.settingValue}>{FONT_SIZES[fontSizeIndex]}px</Text>
              <TouchableOpacity
                onPress={() => setFontSizeIndex(Math.min(FONT_SIZES.length - 1, fontSizeIndex + 1))}
                style={styles.settingButton}
              >
                <Text style={styles.settingButtonText}>A+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.row}>
              {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTheme(t)}
                  style={[
                    styles.themeSwatch,
                    { backgroundColor: THEMES[t].background },
                    theme === t && styles.themeSwatchActive,
                  ]}
                >
                  <Text style={{ color: THEMES[t].text, fontSize: 12 }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setSettingsVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: { fontSize: 16, fontWeight: '500' },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', marginHorizontal: 8 },
  textContainer: { flex: 1, paddingHorizontal: 20 },
  pageText: { lineHeight: 32 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  navButton: { padding: 8 },
  navButtonText: { fontSize: 15, color: '#007AFF' },
  disabledText: { color: '#bbb' },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  playButtonText: { color: '#fff', fontWeight: '600' },
  pageIndicator: { fontSize: 13 },
  audioProgress: { textAlign: 'center', fontSize: 12, paddingBottom: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  settingLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12, color: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButtonText: { fontWeight: '700' },
  settingValue: { fontSize: 15, minWidth: 50, textAlign: 'center' },
  themeSwatch: {
    width: 60,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  themeSwatchActive: { borderWidth: 2, borderColor: '#007AFF' },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});