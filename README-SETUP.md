# Setup Instructions

## Firebase Configuration

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Firestore Database

2. **Get Firebase Config:**
   - Project Settings → General → Your apps
   - Copy config values

3. **Environment Setup:**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Add your Firebase config to `server/.env`:
   ```
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   OPENAI_API_KEY=your_openai_key
   ```

4. **Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rooms/{roomId} {
         allow read, write: if true;
       }
     }
   }
   ```

5. **Install & Run:**
   ```bash
   npm install
   npm run dev
   ```