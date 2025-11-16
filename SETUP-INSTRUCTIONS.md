# Setup Instructions

## Prerequisites
- Node.js 18+
- Firebase project with Firestore enabled
- OpenAI API key (optional)

## Firebase Admin SDK Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract these values from the JSON:
   - `project_id`
   - `private_key`
   - `client_email`

## Installation

1. Install dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. Configure server environment:
```bash
cd server
cp .env.example .env
```

Edit `.env` and add your Firebase Admin credentials:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
OPENAI_API_KEY=your_openai_key
CLIENT_URL=http://localhost:3000
```

3. Configure client environment (optional):
```bash
cd ../client
cp .env.local.example .env.local
```

## Firestore Setup

Create these indexes in Firebase Console → Firestore → Indexes:

1. Collection: `rooms`
   - Field: `lastSummary` (Ascending)
   - Query scope: Collection

## Running the Application

From the root directory:
```bash
npm run dev
```

Server: http://localhost:3001
Client: http://localhost:3000

## Security Notes

- Never commit `.env` files
- Use Firebase Admin SDK (not client SDK) on server
- Keep private keys secure
- Enable Firestore security rules in production
