import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  firebaseBucketName: process.env.FIREBASE_BUCKET_NAME,
  firebaseDBUrl: process.env.FIREBASE_DB_URL,
  googleServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT,
  googleTranslateAccount: process.env.GOOGLE_TRANSLATE_ACCOUNT,
  openAIKey: process.env.OPENAI_API_KEY,
  projectId: process.env.PROJECT_ID,
};

export default config;
