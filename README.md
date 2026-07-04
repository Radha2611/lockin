**lockin**
A local-first focus session app built with **React Native + Expo**. Set a task, start a timer, and stay in session while **Miru**, your panda companion, keeps you accountable.

**[Download the build](https://expo.dev/accounts/radhas_reverie/projects/lockin/builds/7cea97df-5d1e-4f87-8ace-8091314d8fba)**
---

Overview
_**lockin** is a distraction-aware productivity app designed to help users stay focused. It runs entirely on-device with no backend or authentication. During each session, Miru monitors your focus behavior and reacts whenever you leave the app._


**Features**

**Focus Sessions**
- Set a task and choose a session duration
- Countdown timer with an animated SVG progress ring
- Background themes: **Cozy** · **Night** · **Cutie Space**
- Optional focus music

**Miru**
Your virtual focus companion, with mood states that shift automatically based on your focus behavior:
- **Focused** · **Annoyed** · **Proud**

**Accountability**
- Detects when the app is backgrounded and pauses the timer
- Logs away time and number of app leaves
- Miru turns **Annoyed** if you leave mid-session
- Records a daily app-open mark to build a lightweight streak

**Proof of Work**
Before a session ends:
- **Reflection note** — required, minimum 20 characters
- **Photo of completed work** — optional
- Task completion status

**Local Storage**
Everything is stored on-device via `AsyncStorage` — no backend, auth, or cloud required:
- profile · session history · reflections · photos · leave count · away time · mood history · daily activity
---

**Tech Stack:**
| **Category**            | **Technology / Framework**                      |
| ----------------------- | ----------------------------------------------- |
| **Frontend Framework**  | React Native + Expo SDK 54                      |
| **Navigation**          | React Navigation                                |
| **Local Storage**       | AsyncStorage                                    |
| **Background Video**    | expo-video                                      |
| **Audio**               | expo-audio                                      |
| **Image Picker**        | expo-image-picker                               |
| **SVG Rendering**       | react-native-svg + react-native-svg-transformer |
| **Animation**           | React Native Animated API                       |
| **App State Detection** | React Native AppState                           |
| **UI Design**           | Figma                                           |
| **Logo Design**         | Canva                                           |


## How It Works
1. **Create a session** — enter a task, select a focus duration
2. **Start** — timer, background theme, music, and Miru run together
3. **On leaving the app** — timer pauses, Miru turns annoyed, leave timestamp recorded
4. **On returning** — away time calculated, timer resumes, leave count updated
5. **Before finishing** — reflection required, photo optional, task can be marked complete
6. **On save** — session, profile, and daily activity persist locally via AsyncStorage
---

**Getting Started**
```bash
git clone https://github.com/Radha2611/lockin.git
cd lockin
npm install
npx expo start
```

Run using Expo Go or a development build compatible with Expo SDK 54.


