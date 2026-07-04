# Quickstart & Validation Guide

## 1. Validating UI/UX Improvements

Run the application on an emulator or physical device.

**Steps**:
1. Open the app to the login or booking screen.
2. Verify that text fields (`TextFormField`) have clear visible borders and sufficient padding.
3. Verify that text inside fields and on buttons is large enough and has high contrast (easy to read).
4. Tap on buttons to ensure they have an adequate tap target area (they shouldn't feel cramped).

## 2. Validating Release Build Optimization

To test the performance improvements, you must build and run the release version of the Android app, as debug mode has significant overhead.

**Steps**:
1. Open a terminal in the `AndroidApp` directory.
2. Run the following command to build the release APK:
   `flutter build apk --release`
3. Install the APK on a physical Android device:
   `flutter install`
4. Launch the app on the device.
5. Verify that the startup time feels significantly faster than when running via typical IDE debug.
6. Scroll through lists (e.g., booking history or court lists) to verify the frame rate is smooth.
