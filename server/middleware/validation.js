const validator = require('validator');

const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return validator.escape(text.trim().slice(0, 2000));
};

const sanitizeUsername = (username) => {
  if (!username || typeof username !== 'string') return '';
  const cleaned = username.trim().slice(0, 50);
  return validator.escape(cleaned);
};

const sanitizeRoomId = (roomId) => {
  if (!roomId || typeof roomId !== 'string') return '';
  return validator.escape(roomId.trim().slice(0, 20));
};

const validateMessage = (req, res, next) => {
  const { sender, text } = req.body;
  
  if (!sender || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  req.body.sender = sanitizeUsername(sender);
  req.body.text = sanitizeText(text);
  
  if (!req.body.sender || !req.body.text) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  next();
};

const validateRoom = (req, res, next) => {
  const { name, username } = req.body;
  
  if (!name || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  req.body.name = sanitizeText(name);
  req.body.username = sanitizeUsername(username);
  
  if (!req.body.name || !req.body.username) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  next();
};

const validateJoin = (req, res, next) => {
  const { username } = req.body;
  const { roomId } = req.params;
  
  if (!username || !roomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  req.body.username = sanitizeUsername(username);
  req.params.roomId = sanitizeRoomId(roomId);
  
  if (!req.body.username || !req.params.roomId) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  next();
};

module.exports = {
  sanitizeText,
  sanitizeUsername,
  sanitizeRoomId,
  validateMessage,
  validateRoom,
  validateJoin
};
