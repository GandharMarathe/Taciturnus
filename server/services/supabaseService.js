const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class SupabaseService {
  async createRoom(roomId, name, username) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        room_id: roomId,
        name,
        participants: [username],
        ai_mode: 'summarizer'
      })
      .select();
    
    if (error) throw error;
    return { roomId, name };
  }

  async joinRoom(roomId, username) {
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', roomId)
      .single();
    
    if (!room) return null;
    
    const participants = [...new Set([...room.participants, username])];
    
    await supabase
      .from('rooms')
      .update({ participants })
      .eq('room_id', roomId);
    
    return { ...room, participants };
  }

  async addMessage(roomId, message) {
    await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender: message.sender,
        text: message.text,
        is_ai: message.isAI || false
      });
  }

  async getMessages(roomId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    return data || [];
  }

  async updateAiMode(roomId, mode) {
    await supabase
      .from('rooms')
      .update({ ai_mode: mode })
      .eq('room_id', roomId);
  }
}

module.exports = new SupabaseService();