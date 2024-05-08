import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../google-service-account.json';
import config from '../../config';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: config.firebaseDBUrl,
});
const bucketName = config.firebaseBucketName;

const db = admin.database();

const addEntry = async ({ ref, contentEntry }) => {
  try {
    await db.ref(ref).update(contentEntry);
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

const getFirebaseContent = async ({ ref }) => {
  const postsRef = db.ref(ref);
  try {
    const res = await postsRef.once('value');
    const japaneseContent = res.val();
    console.log('## japaneseContent: ', japaneseContent);
    return japaneseContent;
  } catch (error) {
    console.error('Error retrieving posts:', error);
    return error;
  }
};

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

export { uploadBufferToFirebase, getFirebaseContent, addEntry };
