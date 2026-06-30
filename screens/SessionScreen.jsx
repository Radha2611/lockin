import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  AppState, StatusBar, Alert,
} from 'react-native'
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio'
import Panda         from '../components/Panda'
import TimerRing     from '../components/TimerRing'
import SessionBgVideo from '../components/SessionBgVideo'
import { useTapSound } from '../utils/useTapSound'

const BACKGROUNDS = [
  {
    id: 'cozy',
    label: 'cozy',
    video: require('../assets/bg-cozy-lockin.mp4'),
    isNight: false,
  },
  {
    id: 'night',
    label: 'night',
    video: require('../assets/bg-night-lockin.mp4'),
    isNight: true,
  },
  {
    id: 'cutiespace',
    label: 'cutiespace',
    video: require('../assets/bg-cutie-lockin.mp4'),
    isNight: false,
  },
]

const TRACKS = {
  silent: {
    label: 'silent voice soundtrack',
    source: require('../assets/audio01_silent_voice.mpeg'),
  },
  anne: {
    label: 'anne of green gables + rain',
    source: require('../assets/audio01_anneofgreengablesmpeg.mpeg'),
  },
}

export default function SessionScreen({ route, navigation }) {
  const { taskName = 'focus session', targetMins = 25 } = route?.params ?? {}
  const totalSeconds = targetMins * 60

  const [elapsed,        setElapsed]        = useState(0)
  const [timeLeft,       setTimeLeft]       = useState(totalSeconds)
  const [pandaMood,      setPandaMood]      = useState('idle')
  const [leftCount,      setLeftCount]      = useState(0)
  const [leftSecs,       setLeftSecs]       = useState(0)
  const [bg,             setBg]             = useState(BACKGROUNDS[0])
  const [bgPickerOpen,   setBgPickerOpen]   = useState(false)
  const [musicOn,        setMusicOn]        = useState(false)
  const [trackId,        setTrackId]        = useState(null)

  const intervalRef  = useRef(null)
  const appStateRef  = useRef(AppState.currentState)
  const backgroundAt = useRef(null)
  const elapsedRef   = useRef(0)
  const leftSecsRef  = useRef(0)
  const musicOnRef   = useRef(false)

  const audioPlayer = useAudioPlayer(null)
  const playTap     = useTapSound()

  useEffect(() => { elapsedRef.current  = elapsed  }, [elapsed])
  useEffect(() => { leftSecsRef.current = leftSecs }, [leftSecs])

  const safePause = useCallback(() => {
    if (!musicOnRef.current) return
    try {
      audioPlayer.pause()
    } catch {
      // native player may already be released on unmount
    }
    musicOnRef.current = false
  }, [audioPlayer])

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {})
    return () => safePause()
  }, [safePause])

  const stopMusic = useCallback(() => {
    safePause()
    setMusicOn(false)
    setTrackId(null)
  }, [safePause])

  const startMusic = useCallback((id) => {
    const track = TRACKS[id]
    if (!track) return
    audioPlayer.replace(track.source)
    audioPlayer.loop = true
    audioPlayer.volume = 0.42
    audioPlayer.play()
    musicOnRef.current = true
    setMusicOn(true)
    setTrackId(id)
  }, [audioPlayer])

  const handleMusicToggle = () => {
    playTap()
    if (musicOn) {
      stopMusic()
      return
    }
    Alert.alert('focus music', 'pick a soundtrack for your session', [
      { text: TRACKS.silent.label, onPress: () => { playTap(); startMusic('silent') } },
      { text: TRACKS.anne.label, onPress: () => { playTap(); startMusic('anne') } },
      { text: 'cancel', style: 'cancel' },
    ])
  }

  const startTicking = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        setTimeLeft(totalSeconds - next)
        if (next >= totalSeconds) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setPandaMood('proud')
          setTimeout(() => goToExit('proud'), 1200)
        }
        return next
      })
    }, 1000)
  }, [totalSeconds])

  const stopTicking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    setPandaMood('focused')
    startTicking()
    return () => stopTicking()
  }, [])

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      const prev = appStateRef.current
      appStateRef.current = nextState

      if (prev === 'active' && nextState.match(/inactive|background/)) {
        backgroundAt.current = Date.now()
        stopTicking()
        setPandaMood('annoyed')
        setLeftCount(c => c + 1)
      }

      if (prev.match(/inactive|background/) && nextState === 'active') {
        if (backgroundAt.current) {
          const away = Math.floor((Date.now() - backgroundAt.current) / 1000)
          setLeftSecs(s => s + away)
          backgroundAt.current = null
        }
        if (elapsedRef.current < totalSeconds) {
          startTicking()
          const remaining = totalSeconds - elapsedRef.current
          setPandaMood(remaining <= 120 ? 'proud' : 'focused')
        }
      }
    })
    return () => sub.remove()
  }, [startTicking, stopTicking, totalSeconds])

  useEffect(() => {
    if (timeLeft <= 120 && timeLeft > 0) {
      setPandaMood(m => (m === 'annoyed' ? m : 'proud'))
    }
  }, [timeLeft])

  useEffect(() => {
    if (elapsed > 0 && elapsed % 600 === 0 && elapsed < totalSeconds && timeLeft > 120) {
      setPandaMood(m => (m === 'annoyed' ? m : 'proud'))
      const t = setTimeout(() => {
        setPandaMood(m => (m === 'annoyed' ? m : 'focused'))
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [elapsed, totalSeconds, timeLeft])

  const goToExit = (mood = pandaMood) => {
    stopTicking()
    stopMusic()
    const params = {
      taskName,
      targetMins,
      elapsed:   elapsedRef.current,
      leftCount,
      leftSecs:  leftSecsRef.current,
      mood,
      sessionId: String(Date.now()),
    }
    setTimeout(() => {
      navigation.replace('Exit', params)
    }, 100)
  }

  const handleRequestExit = () => {
    playTap()
    const pctDone = elapsed / totalSeconds
    if (pctDone < 0.5) {
      setPandaMood('annoyed')
      Alert.alert(
        'already?',
        `you've only done ${Math.round(pctDone * 100)}% of your session. still want to stop?`,
        [
          { text: 'keep going', style: 'cancel', onPress: () => setPandaMood('focused') },
          { text: 'yes, exit',  style: 'destructive', onPress: () => goToExit('annoyed') },
        ]
      )
    } else {
      goToExit(pctDone >= 1 ? 'proud' : 'focused')
    }
  }

  const moodLine = {
    idle:    'getting ready…',
    focused: 'watching you work',
    annoyed: 'you left again.',
    proud:   'great job!!',
  }[pandaMood]

  const isNight = bg.isNight
  const onLightVideo = !isNight
  const mutedText = onLightVideo ? styles.textMutedLight : styles.textMutedNight
  const subtleText = onLightVideo ? styles.textSubtleLight : styles.textSubtleNight

  return (
    <View style={styles.root}>
      <SessionBgVideo key={bg.id} source={bg.video} isNight={isNight} bgId={bg.id} />

      <StatusBar barStyle={isNight ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.taskName, isNight && styles.textLight]} numberOfLines={1}>
          {taskName}
        </Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            onPress={handleMusicToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.iconBtn, musicOn && styles.iconBtnActive]}
          >
            <Text style={[styles.iconBtnText, isNight && styles.textLight, musicOn && styles.iconBtnTextActive]}>
              ♪
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { playTap(); setBgPickerOpen(o => !o) }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.bgBtn, isNight ? styles.textLight : styles.bgBtnLight]}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {musicOn && trackId && (
        <Text style={[styles.musicHint, mutedText, onLightVideo && styles.textShadowLight]} numberOfLines={1}>
          ♪ {TRACKS[trackId].label}
        </Text>
      )}

      {bgPickerOpen && (
        <View style={styles.bgPicker}>
          {BACKGROUNDS.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[styles.bgChip, bg.id === b.id && styles.bgChipActive]}
              onPress={() => { playTap(); setBg(b); setBgPickerOpen(false) }}
            >
              <Text style={[styles.bgChipText, bg.id === b.id && styles.bgChipTextActive]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.pandaWrap}>
        <Panda
          mood={pandaMood}
          size={165}
          labelColor={onLightVideo ? '#242424' : '#bbb'}
        />
        <Text style={[styles.moodLine, mutedText, onLightVideo && styles.textShadowLight]}>
          {moodLine}
        </Text>
      </View>

      {leftCount > 0 && (
        <View style={[styles.awayBadge, isNight && styles.awayBadgeNight]}>
          <Text style={[styles.awayText, isNight && styles.textLight]}>
            left {leftCount}× · {Math.round(leftSecs / 60)} min away
          </Text>
        </View>
      )}

      <TimerRing
        elapsed={elapsed}
        total={totalSeconds}
        timeLeft={Math.max(timeLeft, 0)}
        light={isNight}
        softBackdrop={onLightVideo}
      />

      <TouchableOpacity style={[styles.exitBtn, isNight && styles.exitBtnLight]} onPress={handleRequestExit}>
        <Text style={[styles.exitBtnText, isNight && { color: '#111' }]}>
          request exit
        </Text>
      </TouchableOpacity>

      <Text style={[styles.hint, subtleText, onLightVideo && styles.textShadowLight]}>
        {elapsed < 60 ? 'just getting started' : `${Math.round(elapsed / 60)} min in`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  iconBtnActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  iconBtnText: {
    fontSize: 16,
    color: '#888',
  },
  iconBtnTextActive: {
    color: '#fff',
  },
  bgBtn: {
    fontSize: 22,
    color: '#aaa',
  },
  bgBtnLight: {
    color: '#3d3d3d',
  },
  musicHint: {
    fontSize: 10,
    marginBottom: 6,
    letterSpacing: 0.3,
    zIndex: 1,
  },
  bgPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    width: '100%',
    zIndex: 1,
  },
  bgChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  bgChipActive: {
    borderColor: '#1a1a1a',
    backgroundColor: '#1a1a1a',
  },
  bgChipText: { fontSize: 12, color: '#555' },
  bgChipTextActive: { color: '#fff' },
  pandaWrap: {
    alignItems: 'center',
    marginVertical: 16,
    zIndex: 1,
  },
  moodLine: {
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  awayBadge: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    zIndex: 1,
  },
  awayBadgeNight: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  awayText: { fontSize: 11, color: '#999' },
  exitBtn: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    zIndex: 1,
  },
  exitBtnLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#fff',
  },
  exitBtnText: {
    fontSize: 14,
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  hint: {
    marginTop: 16,
    fontSize: 11,
    letterSpacing: 0.5,
    zIndex: 1,
  },
  textLight: { color: '#f0f0f0' },
  textMutedLight: { color: '#242424' },
  textMutedNight: { color: '#f0f0f0' },
  textSubtleLight: { color: '#333333' },
  textSubtleNight: { color: '#bbb' },
  textShadowLight: {
    textShadowColor: 'rgba(255,255,255,0.92)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
})
