import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { getUser, saveUser, logoutUser, getAvatarSource } from '../storage/user'
import { getSessions, formatDuration } from '../storage/sessions'

const LOGO = require('../assets/lockin-logo.png.png')

export default function ProfileScreen({ navigation }) {
  const [user, setUser]         = useState(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [photoUri, setPhotoUri] = useState(null)
  const [stats, setStats]       = useState({ sessions: 0, totalMins: 0 })
  const [saving, setSaving]     = useState(false)

  useFocusEffect(
    useCallback(() => {
      getUser().then(u => {
        setUser(u)
        if (u) {
          setName(u.name)
          setEmail(u.email)
          setPhotoUri(u.photoUri)
        }
      })
      getSessions().then(sessions => {
        const totalMins = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60)
        setStats({ sessions: sessions.length, totalMins })
      })
    }, [])
  )

  const pickPhoto = async () => {
    Alert.alert('profile photo', 'choose a source', [
      {
        text: 'camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert('camera access needed', 'allow camera in settings to add a photo')
            return
          }
          const res = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
          })
          if (!res.canceled) setPhotoUri(res.assets[0].uri)
        },
      },
      {
        text: 'gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert('photos access needed', 'allow photo library in settings to add a photo')
            return
          }
          const res = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
          })
          if (!res.canceled) setPhotoUri(res.assets[0].uri)
        },
      },
      { text: 'cancel', style: 'cancel' },
    ])
  }

  const handleLogin = async () => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (trimmedName.length < 2) {
      Alert.alert('name needed', 'enter your name to continue')
      return
    }
    if (!trimmedEmail.includes('@')) {
      Alert.alert('email needed', 'enter a valid email')
      return
    }
    setSaving(true)
    const profile = await saveUser({
      name: trimmedName,
      email: trimmedEmail,
      photoUri,
    })
    setUser(profile)
    setSaving(false)
  }

  const handleUpdatePhoto = async () => {
    if (!user) return
    setSaving(true)
    const profile = await saveUser({ ...user, photoUri })
    setUser(profile)
    setSaving(false)
  }

  const handleLogout = () => {
    Alert.alert('sign out?', 'your session history stays on this device', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'sign out',
        style: 'destructive',
        onPress: async () => {
          await logoutUser()
          setUser(null)
          setName('')
          setEmail('')
          setPhotoUri(null)
        },
      },
    ])
  }

  const avatarSource = getAvatarSource({ photoUri })

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.inner}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← back</Text>
      </TouchableOpacity>

      <Image source={LOGO} style={styles.logo} contentFit="contain" />
      <Text style={styles.title}>profile</Text>

      {user ? (
        <View style={styles.card}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto}>
            <Image source={avatarSource} style={styles.avatar} contentFit="cover" />
            <Text style={styles.avatarHint}>tap to change</Text>
          </TouchableOpacity>
          <Text style={styles.greeting}>hey, {user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.totalMins}</Text>
              <Text style={styles.statKey}>min focused</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{stats.sessions}</Text>
              <Text style={styles.statKey}>sessions</Text>
            </View>
          </View>
          {photoUri !== user.photoUri && (
            <TouchableOpacity
              style={[styles.savePhotoBtn, saving && styles.loginBtnDisabled]}
              onPress={handleUpdatePhoto}
              disabled={saving}
            >
              <Text style={styles.loginBtnText}>{saving ? 'saving…' : 'save photo'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>sign out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>sign in to lockin</Text>
          <Text style={styles.cardHint}>local profile — no password needed</Text>

          <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto}>
            <Image source={avatarSource} style={styles.avatar} contentFit="cover" />
            <Text style={styles.avatarHint}>
              {photoUri ? 'tap to change photo' : 'add photo (optional)'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="your name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.loginBtn, saving && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={saving}
          >
            <Text style={styles.loginBtnText}>{saving ? 'saving…' : 'continue →'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#fafaf8' },
  inner:      { alignItems: 'center', paddingTop: 56, paddingHorizontal: 28, paddingBottom: 40 },
  back:       { alignSelf: 'flex-start', marginBottom: 16 },
  backText:   { fontSize: 13, color: '#bbb', letterSpacing: 0.5 },
  logo:       { width: 72, height: 72, marginBottom: 12 },
  title:      { fontSize: 28, fontWeight: '300', color: '#1a1a1a', marginBottom: 24 },
  card:       {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#efefef',
    alignItems: 'center',
  },
  avatarWrap:  { alignItems: 'center', marginBottom: 16 },
  avatar:      {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatarHint:  { fontSize: 11, color: '#bbb', marginTop: 8 },
  cardTitle:   { fontSize: 16, fontWeight: '500', color: '#1a1a1a', marginBottom: 4, alignSelf: 'flex-start' },
  cardHint:    { fontSize: 12, color: '#bbb', marginBottom: 16, alignSelf: 'flex-start' },
  greeting:    { fontSize: 18, fontWeight: '500', color: '#1a1a1a', marginBottom: 4 },
  email:       { fontSize: 13, color: '#aaa', marginBottom: 20 },
  input: {
    width: '100%',
    backgroundColor: '#fafaf8',
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  savePhotoBtn: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginBtnDisabled: { backgroundColor: '#ccc' },
  loginBtnText:     { fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#fafaf8',
    borderRadius: 12,
    width: '100%',
  },
  stat:         { alignItems: 'center', flex: 1 },
  statVal:      { fontSize: 22, fontWeight: '500', color: '#1a1a1a' },
  statKey:      { fontSize: 10, color: '#bbb', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider:  { width: 1, height: 28, backgroundColor: '#eee' },
  logoutBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: { fontSize: 13, color: '#888' },
})
