const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseService {
  async createRoom(roomId, name, username) {
    await setDoc(doc(db, 'rooms', roomId), {
      roomId,
      name,
      participants: [username],
      messages: [],
      aiMode: 'summarizer',
      lastSummary: new Date(),
      createdAt: new Date()
    });
    return { roomId, name };
  }

  async joinRoom(roomId, username) {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return null;
    
    await updateDoc(roomRef, {
      participants: arrayUnion(username)
    });
    
    return roomSnap.data();
  }

  async addMessage(roomId, message) {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      messages: arrayUnion(message)
    });
  }

  async getMessages(roomId) {
    const roomSnap = await getDoc(doc(db, 'rooms', roomId));
    return roomSnap.exists() ? roomSnap.data().messages || [] : [];
  }

  async getAiMode(roomId) {
    const roomSnap = await getDoc(doc(db, 'rooms', roomId));
    return roomSnap.exists() ? roomSnap.data().aiMode : 'summarizer';
  }

  async updateAiMode(roomId, mode) {
    await updateDoc(doc(db, 'rooms', roomId), { aiMode: mode });
  }

  async getRoomsForSummary() {
    return [];
  }

  async updateLastSummary(roomId) {
    await updateDoc(doc(db, 'rooms', roomId), { lastSummary: new Date() });
  }
}

module.exports = new FirebaseService();