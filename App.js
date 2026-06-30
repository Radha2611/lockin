import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import HomeScreen     from './screens/HomeScreen'
import SessionScreen  from './screens/SessionScreen'
import ExitScreen     from './screens/ExitScreen'
import LogScreen      from './screens/LogScreen'
import ProfileScreen  from './screens/ProfileScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fafaf8' },
          }}
        >
          <Stack.Screen name="Home"    component={HomeScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Session" component={SessionScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Exit"    component={ExitScreen} />
          <Stack.Screen name="Log"     component={LogScreen} options={{ animation: 'none' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
