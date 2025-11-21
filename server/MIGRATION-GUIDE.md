# Migration Guide: Firebase Credentials

## Security Update

The application has been updated to use environment variables instead of the `serviceAccountKey.json` file for better security.

## Steps to Migrate

1. **Locate your Firebase credentials**
   - If you have `serviceAccountKey.json`, open it
   - You'll need: `project_id`, `private_key`, and `client_email`

2. **Update your `.env` file**
   ```bash
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   ```

3. **Delete the serviceAccountKey.json file**
   ```bash
   rm server/serviceAccountKey.json
   ```

4. **Verify it's in .gitignore**
   - Already added to `.gitignore`
   - Check your git status to ensure it's not tracked

5. **Restart your server**
   ```bash
   npm start
   ```

## Why This Change?

- **Security**: Credentials in JSON files can be accidentally committed
- **Flexibility**: Environment variables work better in production/cloud deployments
- **Best Practice**: Follows 12-factor app methodology
