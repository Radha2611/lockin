import AsyncStorage from '@react-native-async-storage/async-storage'

const USER_KEY = 'lockin_user'

export const DEFAULT_AVATAR = require('../assets/default-avatar.png')

export function getAvatarSource(user) {
  if (user?.photoUri) return { uri: user.photoUri }
  return DEFAULT_AVATAR
}

export async function getUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function saveUser(user) {
  const profile = {
    id:        user.id || String(Date.now()),
    name:      user.name.trim(),
    email:     user.email.trim().toLowerCase(),
    photoUri:  user.photoUri || null,
    createdAt: user.createdAt || new Date().toISOString(),
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile))
  return profile
}

export async function logoutUser() {
  await AsyncStorage.removeItem(USER_KEY)
}
