const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://taciturnus-15ae9-default-rtdb.firebaseio.com"
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
      const docRef = await db.collection('rooms').doc(roomId)
        .collection('messages').add({
          ...message,
          timestamp: admin.firestore.Timestamp.now(),
          reactions: {},
          readBy: [],
          edited: false
        });
      return docRef.id;
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

  async addReaction(roomId, messageId, emoji, username) {
    try {
      const messageRef = db.collection('rooms').doc(roomId).collection('messages').doc(messageId);
      const messageSnap = await messageRef.get();
      const reactions = messageSnap.data()?.reactions || {};
      
      if (!reactions[emoji]) reactions[emoji] = [];
      if (!reactions[emoji].includes(username)) {
        reactions[emoji].push(username);
      }
      
      await messageRef.update({ reactions });
    } catch (error) {
      console.error('Add reaction error:', error);
      throw new Error('Failed to add reaction');
    }
  }

  async editMessage(roomId, messageId, newText) {
    try {
      await db.collection('rooms').doc(roomId).collection('messages').doc(messageId)
        .update({ text: newText, edited: true });
    } catch (error) {
      console.error('Edit message error:', error);
      throw new Error('Failed to edit message');
    }
  }

  async deleteMessage(roomId, messageId) {
    try {
      await db.collection('rooms').doc(roomId).collection('messages').doc(messageId).delete();
    } catch (error) {
      console.error('Delete message error:', error);
      throw new Error('Failed to delete message');
    }
  }

  async markAsRead(roomId, messageId, username) {
    try {
      await db.collection('rooms').doc(roomId).collection('messages').doc(messageId)
        .update({ readBy: admin.firestore.FieldValue.arrayUnion(username) });
    } catch (error) {
      console.error('Mark as read error:', error);
      throw new Error('Failed to mark as read');
    }
  }

  async pinMessage(roomId, messageId) {
    try {
      await db.collection('rooms').doc(roomId).collection('messages').doc(messageId)
        .update({ pinned: true });
    } catch (error) {
      console.error('Pin message error:', error);
      throw new Error('Failed to pin message');
    }
  }

  async unpinMessage(roomId, messageId) {
    try {
      await db.collection('rooms').doc(roomId).collection('messages').doc(messageId)
        .update({ pinned: false });
    } catch (error) {
      console.error('Unpin message error:', error);
      throw new Error('Failed to unpin message');
    }
  }
}

module.exports = new FirebaseService();
