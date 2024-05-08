import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  firebaseBucketName: process.env.FIREBASE_BUCKET_NAME,
};

export default config;
