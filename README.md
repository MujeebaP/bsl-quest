# BSL Quest

## Project Description
BSL Quest is an interactive Android mobile application designed to aid in learning British Sign Language (BSL) through a fun and engaging mobile experience. It utilizes various gamification elements to make the learning process more immersive. The app offers a range of features from learning individual signs to testing knowledge through quizzes.

## Directory Structure
- `\android` - Contains Android-specific project files and the generated APK.
- `\build` - Contains compiled code. (Generated by running `npm build`)
- `\src` - Contains the source code of the application, including all React components. Majority of the code is held within the `\pages`, `\components` and `\styles` folders.
- `\public` - Contains static assets used by the application such as index.html, favicons, and manifest.
- `\node_modules` - Contains all the dependencies required by the project. (Generated by running `npm install`)
- `capacitor.config` - Contains configuration for Capacitor to bridge native and web worlds.
- `package.json` - Lists project dependencies and metadata.
- `package-lock.json` - Locks the dependencies to specific versions to ensure consistent installs.
- `README.md` - This file includes instructions and information about the project.

## Execution Instructions
To run the BSL Quest app, you will need to install it on an Android device. The installation file (APK) can be obtained in four ways:

## Option 1: Via Distribution List
If methods fail to allow you to access the BSL Quest app, please do not hesitate to get in touch with me directly at [ec21553@qmul.ac.uk](mailto:ec21553@qmul.ac.uk). You can email me to request inclusion in the app distribution list. As a member of this list, you will receive an email invitation through Google Cloud Platform's Firebase App Distribution service. This invitation will provide you with a link to download and install the BSL Quest APK directly onto your Android device. The Firebase App Distribution service facilitates a smoother installation process and ensures that you receive the latest version of the app and is the PREFERRED method. I was unable to add this link here due to expiry reasons.

### Option 2: Via Google Drive
1. Download the APK from the Google Drive link: [BSL Quest APK](https://drive.google.com/file/d/12dnmOdi_wnsp_3vajd_CFDQg-mPTnHlC/view?usp=sharing)
2. Allow installation from unknown sources on your Android device. This can typically be done in the `Settings > Security` section.
3. Use a file manager on your Android device to navigate to the downloaded APK and tap on it to install.

### Option 3: Via Project Directory
The APK can also be found in the project directory at `bsl-quest\android\app\release`.
To install the APK on your Android device, you can transfer the file by any preferred method. Below are a couple of common methods:

### Transfer via WhatsApp
1. Send the `app-release.apk` file to yourself via WhatsApp.
2. Access the chat on your Android device and download the APK file.

### Transfer via USB
1. Connect your Android device to your computer via USB cable.
2. Copy the `app-release.apk` file to your device's storage.
3. Navigate to the file on your device and tap on it to install.

### Option 4: Execution on a Non-Android Device
If an Android device is not available for testing, you can still run the application in a development environment to simulate the mobile experience:
1. Navigate to the root directory of the project via the command line.
2. Run `npm install` to install all required dependencies.
3. Start the application by running `npm start`. This will launch the app in your default web browser.
4. To simulate a mobile device, open the browser's developer tools (usually by pressing `F12` or right-clicking and selecting "Inspect").
5. Toggle the device toolbar (often found as an icon resembling a mobile phone and tablet) to change the view to a mobile device.
6. Set the viewport to a size approximating a mobile device, for instance, `360 x 758` pixels.
7. Interact with the application as you would on a mobile device, using the simulated touch screen in the developer tools.

## Additional Notes
If you encounter any issues while installing the APK from an unknown source, please ensure that the "Install from Unknown Sources" setting is enabled for your chosen package manager or browser on your Android device.

## Dependencies
All dependencies are listed in the `package.json` file. To install them, navigate to the project's root directory and run `npm install`. Ensure you have Node.js and npm installed on your system before running this command.