// import React, { useEffect, useRef, useState } from 'react'
// import { View, Text, StyleSheet, Animated, Easing } from 'react-native'

// const MOOD_LABELS = {
//   idle:    '( ᵔ ᵕ ᵔ )',
//   focused: '( ¬ ‿ ¬ )',
//   annoyed: '( ಠ ╭╮ ಠ )',
//   proud:   '( ≧ ◡ ≦ )',
//   sleepy:  '( ￣ ω ￣ )',
// }

// const IDLE_HI_FRAMES = [
//   require('../assets/miru-idle01.svg').default,
//   require('../assets/miru-idle02.svg').default,
//   require('../assets/miru-idle03.svg').default,
//   require('../assets/miru-idle04.svg').default,
//   require('../assets/miru-idle05.svg').default,
//   require('../assets/miru-idle06.svg').default,
//   require('../assets/miru-idle07.svg').default,
// ]

// const REST_FRAME = 0
// const WAVE_FRAMES = [1, 2, 3, 4, 5, 6]
// const REST_MS = 2200
// const WAVE_MS = 95
// const PEAK_MS = 130
// const SETTLE_MS = 500

// function loadMoodSvg(mood) {
//   switch (mood) {
//     case 'annoyed':
//       return require('../assets/miru-madd.svg').default
//     case 'proud':
//       return require('../assets/miru-proud.svg').default
//     case 'sleepy':
//       return require('../assets/miru-sleepy.svg').default
//     case 'idle':
//     case 'focused':
//     default:
//       return require('../assets/miru-idle01.svg').default
//   }
// }

// function wait(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// export default function Panda({ mood = 'idle', size = 165, labelColor = '#bbb' }) {
//   const [idleFrame, setIdleFrame] = useState(0)
//   const [waving, setWaving] = useState(false)

//   const float = useRef(new Animated.Value(0)).current
//   const shake = useRef(new Animated.Value(0)).current
//   const scale = useRef(new Animated.Value(1)).current
//   const tilt = useRef(new Animated.Value(0)).current
//   const waveX = useRef(new Animated.Value(0)).current
//   const frameOpacity = useRef(new Animated.Value(1)).current

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(float, {
//           toValue: -6,
//           duration: 1800,
//           easing: Easing.inOut(Easing.sin),
//           useNativeDriver: true,
//         }),
//         Animated.timing(float, {
//           toValue: 0,
//           duration: 1800,
//           easing: Easing.inOut(Easing.sin),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start()
//   }, [float])

//   useEffect(() => {
//     if (mood !== 'idle') {
//       setIdleFrame(0)
//       setWaving(false)
//       scale.setValue(1)
//       tilt.setValue(0)
//       waveX.setValue(0)
//       frameOpacity.setValue(1)
//       return
//     }

//     let cancelled = false

//     const pulseFrame = () => {
//       frameOpacity.setValue(0.72)
//       Animated.timing(frameOpacity, {
//         toValue: 1,
//         duration: 110,
//         easing: Easing.out(Easing.quad),
//         useNativeDriver: true,
//       }).start()
//     }

//     const playWave = async () => {
//       while (!cancelled) {
//         setWaving(false)
//         setIdleFrame(REST_FRAME)
//         await wait(REST_MS)
//         if (cancelled) break

//         setWaving(true)
//         for (const frame of WAVE_FRAMES) {
//           if (cancelled) break
//           setIdleFrame(frame)
//           pulseFrame()

//           const peak = frame === 3
//           const lift = frame >= 2 && frame <= 4
//           const lean = frame <= 3 ? 4 : -3
//           const nudge = frame <= 3 ? 3 : -2

//           Animated.parallel([
//             Animated.timing(scale, {
//               toValue: lift ? (peak ? 1.045 : 1.028) : 1,
//               duration: WAVE_MS,
//               easing: Easing.out(Easing.quad),
//               useNativeDriver: true,
//             }),
//             Animated.timing(tilt, {
//               toValue: lean,
//               duration: WAVE_MS,
//               useNativeDriver: true,
//             }),
//             Animated.timing(waveX, {
//               toValue: nudge,
//               duration: WAVE_MS,
//               useNativeDriver: true,
//             }),
//           ]).start()

//           await wait(peak ? PEAK_MS : WAVE_MS)
//         }

//         if (cancelled) break

//         setIdleFrame(REST_FRAME)
//         setWaving(false)
//         pulseFrame()
//         Animated.parallel([
//           Animated.spring(scale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
//           Animated.timing(tilt, { toValue: 0, duration: 180, useNativeDriver: true }),
//           Animated.timing(waveX, { toValue: 0, duration: 180, useNativeDriver: true }),
//         ]).start()
//         await wait(SETTLE_MS)
//       }
//     }

//     playWave()
//     return () => { cancelled = true }
//   }, [mood, scale, tilt, waveX, frameOpacity])

//   useEffect(() => {
//     if (mood === 'annoyed') {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(shake, { toValue: -4, duration: 80, useNativeDriver: true }),
//           Animated.timing(shake, { toValue:  4, duration: 80, useNativeDriver: true }),
//           Animated.timing(shake, { toValue:  0, duration: 80, useNativeDriver: true }),
//         ]),
//         { iterations: 3 }
//       ).start()
//     }
//   }, [mood, shake])

//   const SvgComponent = mood === 'idle'
//     ? IDLE_HI_FRAMES[idleFrame]
//     : loadMoodSvg(mood)

//   const translateY = mood === 'annoyed' ? shake : float
//   const rotate = tilt.interpolate({
//     inputRange: [-6, 6],
//     outputRange: ['-6deg', '6deg'],
//   })

//   const moodLabel = mood === 'idle' && waving ? 'hi~' : (MOOD_LABELS[mood] || MOOD_LABELS.idle)

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         {
//           width: size,
//           height: size,
//           opacity: mood === 'idle' ? frameOpacity : 1,
//           transform: [
//             { translateY },
//             { translateX: mood === 'idle' ? waveX : 0 },
//             { scale: mood === 'idle' ? scale : 1 },
//             { rotate: mood === 'idle' ? rotate : '0deg' },
//           ],
//         },
//       ]}
//     >
//       <SvgComponent width={size} height={size} />
//       <Text style={[styles.moodLabel, waving && styles.moodLabelWave, { color: labelColor }]}>
//         {moodLabel}
//       </Text>
//     </Animated.View>
//   )
// }

// const styles = StyleSheet.create({
//   container: { alignItems: 'center', justifyContent: 'center' },
//   moodLabel: {
//     fontSize: 11,
//     color: '#bbb',
//     marginTop: 4,
//     letterSpacing: 0.5,
//   },
//   moodLabelWave: {
//     letterSpacing: 1.2,
//     fontWeight: '500',
//   },
// })
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'

const MOOD_LABELS = {
  idle:    '( ᵔ ᵕ ᵔ )',
  focused: '( ¬ ‿ ¬ )',
  annoyed: '( ಠ ╭╮ ಠ )',
  proud:   '( ≧ ◡ ≦ )',
}

const IDLE_HI_FRAMES = [
  require('../assets/miru-idle01.svg').default,
  require('../assets/miru-idle02.svg').default,
  require('../assets/miru-idle03.svg').default,
  require('../assets/miru-idle04.svg').default,
  require('../assets/miru-idle05.svg').default,
  require('../assets/miru-idle06.svg').default,
  require('../assets/miru-idle07.svg').default,
]

const REST_FRAME = 0
const WAVE_FRAMES = [1, 2, 3, 4, 5, 6]
const REST_MS = 2200
const WAVE_MS = 95
const PEAK_MS = 130
const SETTLE_MS = 500

function loadMoodSvg(mood) {
  switch (mood) {
    case 'annoyed':
      return require('../assets/miru-annoyed.svg').default
    case 'proud':
      return require('../assets/miru-proud.svg').default
    case 'idle':
    case 'focused':
    default:
      return require('../assets/miru-idle01.svg').default
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function Panda({ mood = 'idle', size = 165, labelColor = '#bbb' }) {
  const [idleFrame, setIdleFrame] = useState(0)
  const [waving, setWaving] = useState(false)

  const float = useRef(new Animated.Value(0)).current
  const shake = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(1)).current
  const tilt = useRef(new Animated.Value(0)).current
  const waveX = useRef(new Animated.Value(0)).current
  const frameOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [float])

  useEffect(() => {
    if (mood !== 'idle') {
      setIdleFrame(0)
      setWaving(false)
      scale.setValue(1)
      tilt.setValue(0)
      waveX.setValue(0)
      frameOpacity.setValue(1)
      return
    }

    let cancelled = false

    const pulseFrame = () => {
      frameOpacity.setValue(0.72)
      Animated.timing(frameOpacity, {
        toValue: 1,
        duration: 110,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
    }

    const playWave = async () => {
      while (!cancelled) {
        setWaving(false)
        setIdleFrame(REST_FRAME)
        await wait(REST_MS)
        if (cancelled) break

        setWaving(true)
        for (const frame of WAVE_FRAMES) {
          if (cancelled) break
          setIdleFrame(frame)
          pulseFrame()

          const peak = frame === 3
          const lift = frame >= 2 && frame <= 4
          const lean = frame <= 3 ? 4 : -3
          const nudge = frame <= 3 ? 3 : -2

          Animated.parallel([
            Animated.timing(scale, {
              toValue: lift ? (peak ? 1.045 : 1.028) : 1,
              duration: WAVE_MS,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(tilt, {
              toValue: lean,
              duration: WAVE_MS,
              useNativeDriver: true,
            }),
            Animated.timing(waveX, {
              toValue: nudge,
              duration: WAVE_MS,
              useNativeDriver: true,
            }),
          ]).start()

          await wait(peak ? PEAK_MS : WAVE_MS)
        }

        if (cancelled) break

        setIdleFrame(REST_FRAME)
        setWaving(false)
        pulseFrame()
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(waveX, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start()
        await wait(SETTLE_MS)
      }
    }

    playWave()
    return () => { cancelled = true }
  }, [mood, scale, tilt, waveX, frameOpacity])

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

  const SvgComponent = mood === 'idle'
    ? IDLE_HI_FRAMES[idleFrame]
    : loadMoodSvg(mood)

  const translateY = mood === 'annoyed' ? shake : float
  const rotate = tilt.interpolate({
    inputRange: [-6, 6],
    outputRange: ['-6deg', '6deg'],
  })

  const moodLabel = mood === 'idle' && waving ? 'hi~' : (MOOD_LABELS[mood] || MOOD_LABELS.idle)

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity: mood === 'idle' ? frameOpacity : 1,
          transform: [
            { translateY },
            { translateX: mood === 'idle' ? waveX : 0 },
            { scale: mood === 'idle' ? scale : 1 },
            { rotate: mood === 'idle' ? rotate : '0deg' },
          ],
        },
      ]}
    >
      <SvgComponent width={size} height={size} />
      <Text style={[styles.moodLabel, waving && styles.moodLabelWave, { color: labelColor }]}>
        {moodLabel}
      </Text>
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
  moodLabelWave: {
    letterSpacing: 1.2,
    fontWeight: '500',
  },
})