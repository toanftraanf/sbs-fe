# Stadium Booking System (SBS) - Frontend

A modern React Native application built with Expo for managing stadium bookings and reservations. This app supports both customer and owner roles with features like real-time booking, Google OAuth authentication, map integration, and comprehensive reservation management.

## 🚀 Features

- **Multi-role Authentication**: Customer and Stadium Owner roles with Google OAuth
- **Real-time Booking**: Interactive time slot grids for stadium reservations
- **Map Integration**: Find nearby stadiums using Goong Maps API
- **Reservation Management**: Complete booking lifecycle management
- **Profile Management**: User profiles with customizable information
- **Premium Features**: Premium package system for enhanced functionality
- **Cross-platform**: iOS, Android, and Web support via Expo

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g @expo/cli`)
- [Git](https://git-scm.com/)

For mobile development:

- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sbs-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup) below)

4. **Start the development server**
   ```bash
   npx expo start
   ```

## ⚙️ Environment Setup

### 1. Create Environment File

Create a `.env` file in the root directory by copying from the example:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Fill in your `.env` file with the following variables:

```bash
# Google OAuth Credentials
EXPO_GOOGLE_CLIENT_ID=your_expo_google_client_id_here
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id_here
GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here
GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here

# Maps API Key
EXPO_PUBLIC_GOONG_API_KEY=your_goong_api_key_here

# API Configuration
API_BASE_URL=your_backend_api_url_here
API_VERSION=v1

# Environment
ENV=dev
```

## 🔑 Third-Party Service Setup

### Google OAuth Setup

1. **Go to Google Cloud Console**

   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**

   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"

4. **Configure OAuth Consent Screen**

   - Fill in app name, user support email, developer contact
   - Add necessary scopes for profile and email access

5. **Create Client IDs for each platform:**

   **Android:**

   - Application type: Android
   - Package name: Your app's package name from `app.json`
   - SHA-1 certificate fingerprint: Get from your keystore

   **iOS:**

   - Application type: iOS
   - Bundle ID: Your app's bundle identifier from `app.json`

   **Web:**

   - Application type: Web application
   - Authorized redirect URIs: Add your domain

6. **Copy the Client IDs to your `.env` file**

### Goong Maps API Setup

1. **Create Goong Account**

   - Visit [Goong.io](https://goong.io/)
   - Sign up for a developer account

2. **Get API Key**

   - Go to your dashboard
   - Create a new API key
   - Configure restrictions if needed (recommended for production)

3. **Add to Environment**
   - Copy the API key to `EXPO_PUBLIC_GOONG_API_KEY` in your `.env` file

### Backend API Setup

1. **Set up your backend server** (separate repository/setup)
2. **Configure API URL**
   - Set `API_BASE_URL` to your backend server URL
   - For local development: `http://{your-ip-address}:8089` (or your port)
   - For production: Your deployed backend URL

## 📱 Running the App

### Development Mode

```bash
# Start Expo development server
npx expo start

# For specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Building for Production

```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Build for Web
npx expo export:web
```

## 🏗️ Project Structure

```
sbs-fe/
├── app/                    # File-based routing (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── profile/           # Profile management
│   ├── stadium-booking/   # Stadium booking flow
│   └── stadium-list/      # Stadium listing
├── assets/                # Static assets (images, fonts, icons)
├── components/            # Reusable UI components
├── config/                # Configuration files
├── constants/             # App constants
├── contexts/              # React contexts (Auth, etc.)
├── dto/                   # Data Transfer Objects
├── entities/              # TypeScript entity definitions
├── graphql/               # GraphQL related files
├── hooks/                 # Custom React hooks
├── services/              # API service functions
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── prisma/               # Database schema (if applicable)
```

## 🔧 Key Technologies

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: React Context + Custom Hooks
- **Authentication**: Expo AuthSession with Google OAuth
- **Maps**: React Native Maps + Goong Maps API
- **HTTP Client**: Fetch API with custom service layer
- **TypeScript**: Full type safety throughout the app

## 🎯 Core Features Explained

### Authentication System

- Multi-role authentication (Customer/Owner)
- Google OAuth integration
- Persistent login with secure token storage

### Booking System

- Interactive time slot grid
- Real-time availability checking
- Multi-court stadium support
- Booking status management (Pending, Confirmed, Cancelled, Completed)

### Map Integration

- Find nearby stadiums based on location
- Custom map markers and callouts
- Address geocoding and reverse geocoding

### Reservation Management

- Comprehensive reservation modal with full details
- Status change capabilities for stadium owners
- Reservation history and filtering

## 🐛 Troubleshooting

### Common Issues

1. **Google OAuth not working**

   - Check client IDs are correctly configured
   - Verify SHA-1 fingerprint for Android
   - Ensure bundle ID matches for iOS

2. **Maps not loading**

   - Verify Goong API key is valid
   - Check internet connectivity
   - Ensure location permissions are granted

3. **API calls failing**

   - Check `API_BASE_URL` is correct
   - Verify backend server is running
   - Check network connectivity

4. **Environment variables not loading**
   - Restart Expo development server after changing `.env`
   - Check variable names match exactly
   - Ensure `.env` file is in root directory

### Debug Mode

Enable debug logging by setting:

```bash
ENV=dev
```

This will show detailed console logs for:

- API requests and responses
- Authentication flow
- Reservation data processing
- Map interactions

## 📄 Scripts

```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Type checking
npm run type-check

# Linting
npm run lint

# Reset project (clean slate)
npm run reset-project
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or need help with setup:

1. Check the troubleshooting section above
2. Review Expo documentation: [https://docs.expo.dev/](https://docs.expo.dev/)
3. Check React Native Maps docs: [https://github.com/react-native-maps/react-native-maps](https://github.com/react-native-maps/react-native-maps)
4. Goong Maps API docs: [https://docs.goong.io/](https://docs.goong.io/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 🏟️⚽**
