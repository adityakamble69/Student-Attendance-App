# Mobile — Phase 0 Notes

This folder has the full **JS/TS skeleton**: `App.tsx`, navigation (role-based
stacks), context (`AuthContext`, `ThemeContext`), the shared `theme.ts` (ported
1:1 from `design.md`), `services/api.ts` (shared axios instance), and
placeholder screens for each role.

## What's NOT included (and why)
The native `android/` and `ios/` folders are **not** generated here, because
they require the React Native CLI + Android Studio / Xcode toolchains, which
aren't available in this sandbox. To get a runnable app on your machine:

```bash
# from an empty folder, one time only:
npx @react-native-community/cli init StudentAttendanceAppNative --skip-install

# then copy the native folders into this project:
cp -r StudentAttendanceAppNative/android ./android
cp -r StudentAttendanceAppNative/ios ./ios

# then install deps here and run:
npm install
npm run android   # or: npm run ios
```

Everything under `screens/`, `navigation/`, `context/`, `services/`, `hooks/`,
`utils/` is ready to use as-is once the native shell exists.
