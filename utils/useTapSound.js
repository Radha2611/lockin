import { useCallback } from 'react'
import { useAudioPlayer } from 'expo-audio'

export function useTapSound() {
  const player = useAudioPlayer(require('../assets/tap.wav'))

  return useCallback(() => {
    try {
      player.seekTo(0)
      player.volume = 0.38
      player.play()
    } catch {
      // ignore if player not ready
    }
  }, [player])
}
