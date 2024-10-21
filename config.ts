import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  firebaseBucketName: process.env.FIREBASE_BUCKET_NAME,
  firebaseDBUrl: process.env.FIREBASE_DB_URL,
  googleServiceAccount: process.env.GOOGLE_SERVICE_ACCOUNT,
  openAIKey: process.env.OPENAI_API_KEY,
};

export default config;
