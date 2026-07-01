lockin: A local-first focus session app built with React Native + Expo. Set a task, start a timer, and stay in session while Miru, your panda companion, keeps you accountable.

Overview : lockin is a distraction-aware productivity app designed to help users stay focused. It runs entirely on-device with no backend or authentication. During each session, Miru monitors your focus behavior and reacts whenever you leave the app.

Features
Focus Sessions
Set a task and choose a session duration
Countdown timer with an animated SVG progress ring
Background themes: Cozy · Night · Cutie Space
Optional focus music

Miru
Your virtual focus companion, with mood states that shift automatically based on your focus behavior:
Focused · Annoyed · Proud

Accountability
Detects when the app is backgrounded and pauses the timer
Logs away time and number of app leaves
Miru turns Annoyed if you leave mid-session
Records a daily app-open mark to build a lightweight streak


Proof of Work
Before a session ends:
Reflection note — required, minimum 20 characters
Photo of completed work — optional
Task completion status


Local Storage
Everything is stored on-device via AsyncStorage — no backend, auth, or cloud required:
profile · session history · reflections · photos · leave count · away time · mood history · daily activity

Tech Stack
Category       Technology
Framework      React Native + Expo SDK 54
Navigation     React Navigation 
Local storage  AsyncStorage 
Background video expo-video
Audio          expo-audio
Image picker   expo-image-picker
SVG rendering  react-native-svg + react-native-svg-transformer
Animation      React Native Animated API
App state detection React Native AppState 
UI design      Figma
Logo design    Canva

How It Works
Create a session — enter a task, select a focus duration
Start — timer, background theme, music, and Miru run together
On leaving the app — timer pauses, Miru turns annoyed, leave timestamp recorded
On returning — away time calculated, timer resumes, leave count updated
Before finishing — reflection required, photo optional, task can be marked complete
On save — session, profile, and daily activity persist locally via AsyncStorage

Getting Started
bashgit clone https://github.com/Radha2611/lockin.git
cd lockin
npm install
npx expo start

Run using Expo Go or a development build compatible with Expo SDK 54.

Known Issues
Some background themes still use placeholder colors
Miru is currently a static SVG (no animation yet)
The proof screen may occasionally have a brief loading delay 


made with love
