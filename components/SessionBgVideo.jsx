import React from 'react'
import { StyleSheet, View } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'

const BG_FRAMING = {
  // Anchor to the right and extend width leftward so the cat stays in frame
  // without leaving a white strip on the right edge.
  cozy: { width: '112%', right: 0 },
}

export default function SessionBgVideo({ source, isNight, bgId }) {
  const player = useVideoPlayer(source, p => {
    p.loop = true
    p.muted = true
    p.play()
  })

  const frame = BG_FRAMING[bgId]

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.clip, !isNight && styles.clipLight]}
      pointerEvents="none"
    >
      <VideoView
        player={player}
        style={[
          frame
            ? {
                position: 'absolute',
                top: 0,
                bottom: 0,
                height: '100%',
                width: frame.width,
                right: frame.right,
              }
            : StyleSheet.absoluteFill,
        ]}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isNight
              ? 'rgba(14, 14, 18, 0.48)'
              : 'rgba(250, 250, 248, 0.16)',
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  clipLight: { backgroundColor: '#ebe6de' },
})
