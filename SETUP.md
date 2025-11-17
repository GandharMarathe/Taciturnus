# Setup Instructions

## Firebase Configuration

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database

2. **Get Service Account Key:**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Rename it to `serviceAccountKey.json`
   - Place it in the `server/` directory

3. **Configure Firestore Rules:**
   - Copy rules from `FIRESTORE-RULES.txt` to your Firestore Rules

## Installation

1. **Install dependencies:**
   ```bash
   # Root
   npm install
   
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

2. **Start the application:**
   ```bash
   # From root directory
   npm run dev
   ```

## Environment Variables

- Server uses `serviceAccountKey.json` for Firebase authentication
- Client environment variables go in `client/.env.local`

## Security Note

Never commit `serviceAccountKey.json` to version control. It contains sensitive Firebase credentials.