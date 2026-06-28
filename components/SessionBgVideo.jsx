import React from 'react'
import { StyleSheet, View } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'

export default function SessionBgVideo({ source, isNight }) {
  const player = useVideoPlayer(source, p => {
    p.loop = true
    p.muted = true
    p.play()
  })

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isNight
              ? 'rgba(14, 14, 18, 0.48)'
              : 'rgba(250, 250, 248, 0.55)',
          },
        ]}
      />
    </View>
  )
}
