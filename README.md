# Uptodate Project

Uptodate is a mobile application designed to manage articles. Users can view, like, download articles, and manage their preferences. Admins can add, edit, and delete articles, categories, and users. The project is built using React Native and Flask.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Building the Application](#building-the-application)
  - [Android](#android)
  - [iOS](#ios)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- User Authentication
- View, Like, and Download Articles
- Admin Panel for Managing Users, Categories, and Articles
- "About Us" Section
- Responsive Design

## Requirements

- Node.js
- npm or yarn
- Python 3
- pip
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds)
- Flask

## Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Canyildiz1386/Uptodate.git
   cd uptodate/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server:**
   ```bash
   flask run
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../uptodate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI (if not already installed):**
   ```bash
   npm install -g expo-cli
   ```

4. **Start the Expo development server:**
   ```bash
   expo start
   ```

## Building the Application

### Android

1. **Install EAS CLI (Expo Application Services CLI):**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account:**
   ```bash
   eas login
   ```

3. **Build the Android app:**
   ```bash
   eas build -p android
   ```

4. **Download the `.apk` or `.aab` file from the Expo dashboard.

### iOS

1. **Ensure you have Xcode installed and configured.**

2. **Build the iOS app:**
   ```bash
   eas build -p ios
   ```

3. **Follow the instructions provided by EAS CLI to configure your Apple Developer account and certificates.

4. **Download the `.ipa` file from the Expo dashboard.

## Usage

1. **Admin Login:**
   - Username: `admin`
   - Password: `admin123`

2. **Test User Login:**
   - Username: `testuser`
   - Password: `test123`

3. **Admin Capabilities:**
   - Manage Users
   - Manage Categories
   - Manage Articles

4. **User Capabilities:**
   - View All Articles
   - Like Articles
   - Download Articles
   - View Liked Articles in "My Articles" tab

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

1. **Fork the repository**

2. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**

4. **Commit your changes:**
   ```bash
   git commit -m 'Add some feature'
   ```

5. **Push to the branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a pull request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
