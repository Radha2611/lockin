import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, ScrollView, KeyboardAvoidingView, Platform,
  Animated, Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Panda from '../components/Panda'
import { saveSession, formatDuration } from '../storage/sessions'

const MIN_NOTE_CHARS = 15   // ~2 short lines of reflection

export default function ExitScreen({ route, navigation }) {
  const {
    taskName, targetMins, elapsed,
    leftCount, leftSecs, mood, sessionId,
  } = route.params

  const [note,     setNote]     = useState('')
  const [photoUri, setPhotoUri] = useState(null)
  const [taskDone, setTaskDone] = useState(false)
  const [saving,   setSaving]   = useState(false)

  // shake animation if user tries to submit without enough text
  const shake = useRef(new Animated.Value(0)).current
  const doShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  0, duration: 60, useNativeDriver: true }),
    ]).start()
  }

  // ── Photo picker ──────────────────────────────────────────────────────
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('camera access needed', 'allow camera in settings to attach a photo')
      return
    }
    Alert.alert(
      'attach proof',
      'snap your work or pick from gallery',
      [
        {
          text: '📷 camera',
          onPress: async () => {
            const res = await ImagePicker.launchCameraAsync({
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            })
            if (!res.canceled) setPhotoUri(res.assets[0].uri)
          },
        },
        {
          text: '🖼  gallery',
          onPress: async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            })
            if (!res.canceled) setPhotoUri(res.assets[0].uri)
          },
        },
        { text: 'cancel', style: 'cancel' },
      ]
    )
  }

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (note.trim().length < MIN_NOTE_CHARS) {
      doShake()
      return
    }

    setSaving(true)
    const session = {
      id:         sessionId,
      taskName,
      targetMins,
      duration:   elapsed,
      leftCount,
      leftSecs,
      exitNote:   note.trim(),
      photoUri,
      taskDone,
      mood,
      createdAt:  new Date().toISOString(),
    }
    await saveSession(session)
    setSaving(false)
    navigation.replace('Log')
  }

  const canSubmit   = note.trim().length >= MIN_NOTE_CHARS
  const charsLeft   = Math.max(MIN_NOTE_CHARS - note.trim().length, 0)
  const pandaPrompt = mood === 'proud'
    ? 'great work. tell me what you built.'
    : 'before you go. what did you actually do?'

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Miru (the character) ── */}
        <Panda mood={mood} size={128} />
        <Text style={styles.prompt}>{pandaPrompt}</Text>

        {/* ── Stats strip ── */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatDuration(elapsed)}</Text>
            <Text style={styles.statKey}>worked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{targetMins}m</Text>
            <Text style={styles.statKey}>goal</Text>
          </View>
          {leftCount > 0 && <>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: '#c07060' }]}>{leftCount}×</Text>
              <Text style={styles.statKey}>left</Text>
            </View>
          </>}
        </View>

        {/* ── Note entry ── */}
        <Animated.View style={[styles.noteWrap, { transform: [{ translateX: shake }] }]}>
          <Text style={styles.noteLabel}>what did you do?</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder="wrote the copy for slide 3, picked font pairing, flagged spacing issue for tomorrow…"
            placeholderTextColor="#ccc"
            value={note}
            onChangeText={setNote}
            maxLength={500}
            autoFocus
          />
          {charsLeft > 0
            ? <Text style={styles.charHint}>{charsLeft} more chars to unlock</Text>
            : <Text style={[styles.charHint, { color: '#7ab87a' }]}>✓ enough</Text>
          }
        </Animated.View>

        {/* ── Photo attachment ── */}
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.photoThumb} />
            : <Text style={styles.photoBtnText}>+ attach photo of work  (optional)</Text>
          }
        </TouchableOpacity>
        {photoUri && (
          <TouchableOpacity onPress={() => setPhotoUri(null)}>
            <Text style={styles.removePhoto}>remove photo</Text>
          </TouchableOpacity>
        )}

        {/* ── Task done toggle ── */}
        <TouchableOpacity
          style={[styles.doneToggle, taskDone && styles.doneToggleActive]}
          onPress={() => setTaskDone(d => !d)}
        >
          <Text style={[styles.doneToggleText, taskDone && styles.doneToggleTextActive]}>
            {taskDone ? '✓  task complete' : '○  mark task complete'}
          </Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>
            {saving ? 'saving…' : canSubmit ? 'done, let me go →' : `write ${charsLeft} more chars`}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#fafaf8' },
  inner: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  prompt: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  stat:        { alignItems: 'center', flex: 1 },
  statVal:     { fontSize: 18, fontWeight: '500', color: '#1a1a1a' },
  statKey:     { fontSize: 10, color: '#bbb', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: '#eee' },
  noteWrap: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#efefef',
    padding: 16,
    marginBottom: 14,
  },
  noteLabel: {
    fontSize: 11,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  noteInput: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charHint: {
    fontSize: 11,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'right',
  },
  photoBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  photoBtnText: { fontSize: 13, color: '#bbb' },
  photoThumb:   { width: '100%', height: 160, borderRadius: 10 },
  removePhoto:  { fontSize: 11, color: '#e08080', marginBottom: 14 },
  doneToggle: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  doneToggleActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  doneToggleText:       { fontSize: 13, color: '#aaa' },
  doneToggleTextActive: { color: '#fff' },
  submitBtn: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#e0e0e0' },
  submitBtnText:     { fontSize: 14, color: '#fff', letterSpacing: 0.5 },
})