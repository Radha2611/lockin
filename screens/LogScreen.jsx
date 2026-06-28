import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, StatusBar,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getSessions, formatDuration } from '../storage/sessions'

const MOOD_EMOJI = { proud: '✦', annoyed: '○', focused: '◆', idle: '◇' }

function SessionCard({ item }) {
  const date  = new Date(item.createdAt)
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardMood}>{MOOD_EMOJI[item.mood] ?? '◇'}</Text>
          <View>
            <Text style={styles.cardTask} numberOfLines={1}>{item.taskName}</Text>
            <Text style={styles.cardMeta}>
              {formatDuration(item.duration)}
              {item.taskDone ? '  ·  done ✓' : ''}
              {item.leftCount > 0 ? `  ·  left ${item.leftCount}×` : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{dateStr}{'\n'}{timeStr}</Text>
      </View>

      <Text style={styles.cardNote}>{item.exitNote}</Text>

      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={styles.cardPhoto} />
      )}
    </View>
  )
}

export default function LogScreen({ navigation }) {
  const [sessions, setSessions] = useState([])

  useFocusEffect(
    useCallback(() => {
      getSessions().then(setSessions)
    }, [])
  )

  const totalMins = Math.round(
    sessions.reduce((acc, s) => acc + s.duration, 0) / 60
  )

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Text style={styles.backText}>← home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>log</Text>
        <Text style={styles.subtitle}>{totalMins} min worked · {sessions.length} sessions</Text>
      </View>

      {sessions.length === 0
        ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no sessions yet.</Text>
            <Text style={styles.emptyHint}>finish one and come back.</Text>
          </View>
        )
        : (
          <FlatList
            data={sessions}
            keyExtractor={s => s.id}
            renderItem={({ item }) => <SessionCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )
      }

      <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.newBtnText}>+ new session</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#fafaf8' },
  header:     { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16 },
  backRow:    { marginBottom: 8 },
  backText:   { fontSize: 12, color: '#bbb', letterSpacing: 0.5 },
  title:      { fontSize: 28, fontWeight: '300', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle:   { fontSize: 12, color: '#bbb', marginTop: 4, letterSpacing: 0.5 },
  list:       { paddingHorizontal: 24, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  cardMood:   { fontSize: 16, marginTop: 2, color: '#1a1a1a' },
  cardTask:   { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 },
  cardMeta:   { fontSize: 11, color: '#bbb', letterSpacing: 0.3 },
  cardDate:   { fontSize: 10, color: '#ccc', textAlign: 'right', lineHeight: 16 },
  cardNote:   { fontSize: 13, color: '#666', lineHeight: 20, fontStyle: 'italic' },
  cardPhoto:  { width: '100%', height: 140, borderRadius: 10, marginTop: 10 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:  { fontSize: 16, color: '#bbb' },
  emptyHint:  { fontSize: 12, color: '#ddd', marginTop: 4 },
  newBtn: {
    position: 'absolute',
    bottom: 32, left: 24, right: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newBtnText: { fontSize: 14, color: '#fff', letterSpacing: 0.5 },
})