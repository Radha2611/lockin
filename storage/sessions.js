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

const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's']

export function getWeekEngagement(sessions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekday = today.getDay()
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  return DAY_LABELS.map((label, i) => {
    const dayStart = new Date(monday)
    dayStart.setDate(monday.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)

    const daySessions = sessions.filter(s => {
      const created = new Date(s.createdAt)
      return created >= dayStart && created < dayEnd
    })

    return {
      label,
      isToday: dayStart.getTime() === today.getTime(),
      active: daySessions.length > 0,
      minutes: Math.round(daySessions.reduce((acc, s) => acc + s.duration, 0) / 60),
    }
  })
}
