import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../google-service-account.json';
import config from '../../config';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: config.firebaseDBUrl,
});
const bucketName = config.firebaseBucketName;

const db = admin.database();

const addToSatori = async ({ ref, contentEntry }) => {
  try {
    // Fetch the existing array
    const snapshot = await db.ref(ref).once('value');
    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array

    // Check if the new item's ID already exists in the array
    const entryID = contentEntry.id; // Assuming each entry has a unique 'id' property
    const isDuplicate = newArray.some((item) => item.id === entryID);

    if (!isDuplicate) {
      // Add the new item to the array
      newArray.push(contentEntry);

      // Update the entire array
      await db.ref(ref).set(newArray);
    } else {
      console.log('## Item already exists in DB');
    }
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

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

export { uploadBufferToFirebase, getFirebaseContent, addEntry, addToSatori };
