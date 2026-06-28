import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, StatusBar,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Image } from 'expo-image'
import Panda from '../components/Panda'
import { getUser, getAvatarSource } from '../storage/user'

const PRESETS = [15, 25, 40, 60]
const LOGO = require('../assets/lockin-logo.png.png')

export default function HomeScreen({ navigation }) {
  const [taskName,   setTaskName]   = useState('')
  const [targetMins, setTargetMins] = useState(25)
  const [user,       setUser]       = useState(null)

  useFocusEffect(
    useCallback(() => {
      getUser().then(setUser)
    }, [])
  )

  const canStart = taskName.trim().length > 2

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" />

      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />
          <Text style={styles.appName}>lockin</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.avatarBtn}
        >
          <Image
            source={getAvatarSource(user)}
            style={styles.avatar}
            contentFit="cover"
            accessibilityLabel="open profile"
          />
        </TouchableOpacity>
      </View>

      <Panda mood="idle" size={148} />
      <Text style={styles.tagline}>focus. build. prove it.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. slide 3 carousel copy"
        placeholderTextColor="#ccc"
        value={taskName}
        onChangeText={setTaskName}
        returnKeyType="done"
        maxLength={80}
      />

      <Text style={styles.durationLabel}>session length</Text>
      <View style={styles.presets}>
        {PRESETS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.preset, targetMins === m && styles.presetActive]}
            onPress={() => setTargetMins(m)}
          >
            <Text style={[styles.presetText, targetMins === m && styles.presetTextActive]}>
              {m}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        onPress={() => {
          if (!canStart) return
          navigation.navigate('Session', { taskName: taskName.trim(), targetMins })
        }}
        disabled={!canStart}
      >
        <Text style={styles.startBtnText}>start session</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logLink} onPress={() => navigation.navigate('Log')}>
        <Text style={styles.logLinkText}>view past sessions →</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#fafaf8' },
  inner:    { alignItems: 'center', paddingTop: 56, paddingHorizontal: 28, paddingBottom: 40 },
  topRow:   { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo:     { width: 36, height: 36 },
  appName:  { fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#bbb' },
  avatarBtn: { borderRadius: 18 },
  avatar:   {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  tagline:  { fontSize: 14, color: '#aaa', marginTop: 12, marginBottom: 24, letterSpacing: 0.3 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  durationLabel: {
    alignSelf: 'flex-start',
    fontSize: 11,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  presets: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  preset: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  presetActive:     { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  presetText:       { fontSize: 13, color: '#888' },
  presetTextActive: { color: '#fff' },
  startBtn: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startBtnDisabled: { backgroundColor: '#ddd' },
  startBtnText:     { fontSize: 15, color: '#fff', letterSpacing: 0.5 },
  logLink:          { marginTop: 8 },
  logLinkText:      { fontSize: 12, color: '#bbb', letterSpacing: 0.5 },
})
