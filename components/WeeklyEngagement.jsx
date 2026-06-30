import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function WeeklyEngagement({ days }) {
  const activeCount = days.filter(d => d.active).length

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>{activeCount}/7</Text>
      {days.map((day, i) => (
        <View key={i} style={styles.day}>
          <Text style={[styles.label, day.isToday && styles.labelToday]}>
            {day.label}
          </Text>
          <View style={[styles.dot, day.active && styles.dotActive, day.isToday && styles.dotToday]} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 28,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 24,
    gap: 10,
  },
  heading: {
    fontSize: 9,
    color: '#ccc',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  day: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    color: '#ccc',
    textTransform: 'lowercase',
  },
  labelToday: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#e8e8e8',
  },
  dotActive: {
    backgroundColor: '#1a1a1a',
  },
  dotToday: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
