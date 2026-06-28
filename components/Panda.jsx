import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import MiruIdle    from '../assets/miru-idle.svg'
import MiruAnnoyed from '../assets/miru-annoyed.svg'
import MiruProud   from '../assets/miru-proud.svg'

const MOOD_SVGS = {
  idle:    MiruIdle,
  focused: MiruIdle,
  annoyed: MiruAnnoyed,
  proud:   MiruProud,
}

const MOOD_LABELS = {
  idle:    '( ᵔ ᵕ ᵔ )',
  focused: '( ¬ ‿ ¬ )',
  annoyed: '( ಠ ╭╮ ಠ )',
  proud:   '( ≧ ◡ ≦ )',
}

export default function Panda({ mood = 'idle', size = 165 }) {
  const SvgComponent = MOOD_SVGS[mood] || MOOD_SVGS.idle
  const float = useRef(new Animated.Value(0)).current
  const shake = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -6, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue:  0, duration: 1800, useNativeDriver: true }),
      ])
    ).start()
  }, [float])

  useEffect(() => {
    if (mood === 'annoyed') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shake, { toValue: -4, duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue:  4, duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue:  0, duration: 80, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start()
    }
  }, [mood, shake])

  const translateY = mood === 'annoyed' ? shake : float

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, transform: [{ translateY }] },
      ]}
    >
      <SvgComponent width={size} height={size} />
      <Text style={styles.moodLabel}>{MOOD_LABELS[mood] || MOOD_LABELS.idle}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  moodLabel: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 4,
    letterSpacing: 0.5,
  },
})
