# BillFlow ERP - Android Play Store Compilation Guide

This guide details how to build and package **BillFlow ERP** into a native Android app (`.apk` or `.aab`) using **Capacitor** by Ionic, suitable for publishing on the Google Play Store.

---

## 1. Local Prerequisites

Before compiling the application, ensure the following are installed on your build machine:
- **Node.js** (v18 or higher recommended)
- **Android Studio** (for Gradle compilation & SDK tools)
- **Android SDK Platform** (API levels 30 to 34 recommended)
- **Java Development Kit (JDK)** (JDK 17 is standard for modern Gradle builds)

---

## 2. Installation & Setup Steps

Run these commands in the project root directory (`billflow-erp/`):

### Step A: Install Capacitor CLI & Core libraries
```bash
npm install @capacitor/core @capacitor/cli
```

### Step B: Install the Android Platform Adapter
```bash
npm install @capacitor/android
```

### Step C: Build the Next.js Static Export
We configured `next.config.js` to output statically. Run the Next.js compiler:
```bash
npm run build
```
This builds your React pages and exports them as static HTML/JS files in the `out/` directory.

### Step D: Initialize the Capacitor Platform Wrapper
Since the config file (`capacitor.config.ts`) is already created, add the Android platform project files:
```bash
npx cap add android
```
This creates a fully functional native Android Gradle project under the `android/` directory.

---

## 3. Resolving Native Android Bottlenecks & Pitfalls

Hybrid web apps face specific challenges when wrapped inside Android WebViews. Below is how to resolve them:

### A. WebView LocalStorage Eviction & Quota Limits (Shared Quota Fix)
- **The Problem:** The default Android WebView allocates a shared database file for `localStorage` and restricts it to a **5MB quota**. If the user accumulates thousands of invoice rows, the app will trigger a `QuotaExceededError` and fail to write new sales. Additionally, if the Android device is running low on disk space, the OS will automatically purge the WebView cache, **deleting all local data**.
- **The Solution:** For native production builds, we recommend migrating our Zustand state to the native SQLite database or native key-value storage. 
  - Install the Capacitor Preferences package:
    ```bash
    npm install @capacitor/preferences
    ```
  - In `lib/db.ts`, replace the `localStorage.getItem` and `localStorage.setItem` calls with Preferences wrappers:
    ```typescript
    import { Preferences } from '@capacitor/preferences';

    // Async storage helper instead of localStorage
    const getLocal = async (key: string) => {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    };
    ```

### B. CORS Issues with Backend Cloud APIs (Supabase/WhatsApp)
- **The Problem:** The web app runs locally on the device under the scheme `https://localhost` (or `capacitor://localhost`). Standard web security policies (CORS) will block API calls from this origin to your database (e.g., Supabase) or digital receipt API (WhatsApp) unless explicitly permitted.
- **The Solution:** 
  1. Go to your **Supabase Dashboard** -> Project Settings -> API.
  2. Add `http://localhost`, `https://localhost`, and `capacitor://localhost` to the **Allowed Web Origins** list.
  3. Ensure your server-side API endpoints accept cross-origin requests from these schemes.

### C. Camera Permissions for Barcode Scanner
- **The Problem:** The simulated barcode scanner uses the device camera. The WebView cannot access the camera on Android without permission registration.
- **The Solution:**
  Open `android/app/src/main/AndroidManifest.xml` and insert the camera permissions inside the `<manifest>` tag:
  ```xml
  <!-- Request camera permission for Barcode Scanning -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  ```

### D. Native ESC/POS Thermal Printing
- **The Problem:** Web browsers trigger a print layout with `window.print()`. Inside a native Android app wrapper, `window.print()` will either do nothing or prompt for a desktop PDF printer instead of piping ESC/POS data to Bluetooth or USB thermal printers.
- **The Solution:**
  Use raw sockets or Bluetooth communication packages.
  - Install a native printing plugin:
    ```bash
    npm install cordova-plugin-printer
    npx cap sync
    ```
  - Or, connect directly to Bluetooth thermal devices using `@capacitor-community/bluetooth-le`.

---

## 4. Compilation & Google Play Store Bundling

Once the project is configured, proceed to bundle the APK/AAB:

### Step 1: Synchronize Web Code to Android Assets
Whenever you modify your React/Zustand code, build it and sync it:
```bash
npm run build
npx cap copy android
```

### Step 2: Compile the Project in Android Studio
Open Android Studio and load the `android/` directory:
```bash
npx cap open android
```
Android Studio will initialize the Gradle files.

### Step 3: Generate Signed Release AAB (Android App Bundle)
Google Play Store requires `.aab` format instead of `.apk` for new listings:
1. In Android Studio, go to the top menu and select **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Create a new keystore or choose an existing one (`.jks` certificate file). Set secure passwords and alias names.
4. Set the Build Type to **release** and signature versions to V2 (Full APK Signature).
5. Click **Finish**.

Gradle will compile the build. The signed `.aab` file will be generated in `android/app/release/app-release.aab`, ready to be uploaded to your **Google Play Console** dashboard under internal testing or production tracks!
