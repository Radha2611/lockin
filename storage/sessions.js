import AsyncStorage from '@react-native-async-storage/async-storage'

const SESSIONS_KEY = 'lockin_sessions'

export async function getSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveSession(session) {
  const sessions = await getSessions()
  sessions.unshift(session)
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  return session
}

export async function deleteSession(id) {
  const sessions = (await getSessions()).filter(s => s.id !== id)
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}
