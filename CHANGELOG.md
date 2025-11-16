# Changelog

## [2.0.0] - Security & Performance Update

### Security Fixes
- ✅ Migrated from Firebase Client SDK to Admin SDK on server
- ✅ Added input validation and sanitization (XSS prevention)
- ✅ Implemented rate limiting on API endpoints
- ✅ Added proper error handling across all services
- ✅ Removed hardcoded credentials exposure

### Architecture Improvements
- ✅ Changed message storage from arrays to Firestore subcollections
- ✅ Fixed getRoomsForSummary() implementation
- ✅ Added proper socket connection cleanup
- ✅ Implemented reconnection logic for WebSocket
- ✅ Added environment-based configuration

### Performance Enhancements
- ✅ Implemented message pagination (limit 50 messages)
- ✅ Optimized Firestore queries
- ✅ Added connection status monitoring
- ✅ Reduced unnecessary re-renders

### User Experience
- ✅ Added loading states for async operations
- ✅ Implemented error feedback messages
- ✅ Added connection status indicators
- ✅ Auto-dismiss error messages after 5 seconds
- ✅ Disabled actions when disconnected

### Developer Experience
- ✅ Created comprehensive setup instructions
- ✅ Added Firestore security rules template
- ✅ Improved error logging
- ✅ Added environment variable examples
- ✅ Better code organization with middleware

### Breaking Changes
- Firebase Client SDK replaced with Admin SDK (requires new credentials)
- Messages now stored in subcollections (existing data needs migration)
- Environment variables changed (see .env.example)

### Migration Guide
1. Update dependencies: `npm install` in server directory
2. Get Firebase Admin SDK credentials from Firebase Console
3. Update .env file with new format (see .env.example)
4. Existing messages in arrays won't be accessible (backup if needed)
5. Create Firestore indexes as specified in SETUP-INSTRUCTIONS.md
