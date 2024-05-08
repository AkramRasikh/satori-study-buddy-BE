import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../google-service-account.json';
import config from '../../config';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
const bucketName = config.firebaseBucketName;

const uploadBufferToFirebase = async ({ buffer, filePath }) => {
  const metadata = {
    contentType: 'audio/mpeg',
  };

  const storage = admin.storage();

  try {
    await storage.bucket(bucketName).file(filePath).save(buffer, {
      metadata: metadata,
    });
    console.log('## Successfully uploaded file to Firebase');
  } catch (error) {
    console.error('## Error uploading file to firebase:', error);
  }
};

export { uploadBufferToFirebase };
