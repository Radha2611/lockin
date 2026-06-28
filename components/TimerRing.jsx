import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const SIZE          = 200
const STROKE        = 8
const RADIUS        = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TimerRing({ elapsed, total, timeLeft, light = false }) {
  const progress = total > 0 ? Math.min(elapsed / total, 1) : 0
  const offset   = CIRCUMFERENCE * (1 - progress)

  const mins  = Math.floor(timeLeft / 60)
  const secs  = timeLeft % 60
  const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const trackColor   = light ? 'rgba(255,255,255,0.25)' : '#e0e0e0'
  const progressColor = light ? '#ffffff' : '#1a1a1a'
  const timeColor    = light ? '#ffffff' : '#1a1a1a'
  const subColor     = light ? 'rgba(255,255,255,0.75)' : '#aaa'

  return (
    <View style={[styles.wrap, light && styles.wrapLight]}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={trackColor} strokeWidth={STROKE} fill="none"
        />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={progressColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <View style={styles.label}>
        <Text style={[styles.time, { color: timeColor }]}>{label}</Text>
        <Text style={[styles.sub, { color: subColor }]}>remaining</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  wrapLight: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: SIZE / 2,
  },
  svg:   { position: 'absolute', top: 0, left: 0 },
  label: { alignItems: 'center' },
  time:  { fontSize: 38, fontWeight: '300', letterSpacing: -1 },
  sub:   { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
})
