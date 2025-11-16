const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const db = admin.firestore();

class FirebaseService {
  async createRoom(roomId, name, username) {
    try {
      await db.collection('rooms').doc(roomId).set({
        roomId,
        name,
        participants: [username],
        aiMode: 'summarizer',
        lastSummary: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now()
      });
      return { roomId, name };
    } catch (error) {
      console.error('Create room error:', error);
      throw new Error('Failed to create room');
    }
  }

  async joinRoom(roomId, username) {
    try {
      const roomRef = db.collection('rooms').doc(roomId);
      const roomSnap = await roomRef.get();
      
      if (!roomSnap.exists) return null;
      
      await roomRef.update({
        participants: admin.firestore.FieldValue.arrayUnion(username)
      });
      
      return roomSnap.data();
    } catch (error) {
      console.error('Join room error:', error);
      throw new Error('Failed to join room');
    }
  }

  async addMessage(roomId, message) {
    try {
      await db.collection('rooms').doc(roomId)
        .collection('messages').add({
          ...message,
          timestamp: admin.firestore.Timestamp.now()
        });
    } catch (error) {
      console.error('Add message error:', error);
      throw new Error('Failed to add message');
    }
  }

  async getMessages(roomId, limit = 50) {
    try {
      const snapshot = await db.collection('rooms').doc(roomId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })).reverse();
    } catch (error) {
      console.error('Get messages error:', error);
      return [];
    }
  }

  async getAiMode(roomId) {
    try {
      const roomSnap = await db.collection('rooms').doc(roomId).get();
      return roomSnap.exists ? roomSnap.data().aiMode : 'summarizer';
    } catch (error) {
      console.error('Get AI mode error:', error);
      return 'summarizer';
    }
  }

  async updateAiMode(roomId, mode) {
    try {
      await db.collection('rooms').doc(roomId).update({ aiMode: mode });
    } catch (error) {
      console.error('Update AI mode error:', error);
      throw new Error('Failed to update AI mode');
    }
  }

  async getRoomsForSummary() {
    try {
      const tenMinutesAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 10 * 60 * 1000)
      );
      
      const snapshot = await db.collection('rooms')
        .where('lastSummary', '<', tenMinutesAgo)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Get rooms for summary error:', error);
      return [];
    }
  }

  async updateLastSummary(roomId) {
    try {
      await db.collection('rooms').doc(roomId).update({
        lastSummary: admin.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error('Update last summary error:', error);
    }
  }

  async roomExists(roomId) {
    try {
      const roomSnap = await db.collection('rooms').doc(roomId).get();
      return roomSnap.exists;
    } catch (error) {
      console.error('Room exists check error:', error);
      return false;
    }
  }
}

module.exports = new FirebaseService();
