import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../google-service-account.json';
import config from '../../config';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: config.firebaseDBUrl,
});
const bucketName = config.firebaseBucketName;

const db = admin.database();

const updateJapaneseWord = async ({ ref, word }) => {
  const updatedContexts = word.contexts;
  const entryID = word.id;
  try {
    // Fetch the existing array
    const snapshot = await db.ref(ref).once('value');
    const existingArray = snapshot.val();

    if (existingArray) {
      // Find the index of the entry with the specified entryID
      const index = existingArray.findIndex((entry) => entry.id === entryID);

      if (index !== -1) {
        // Update the 'contexts' field of the entry at the found index
        if (updatedContexts !== undefined) {
          existingArray[index].contexts = updatedContexts;
        } else {
          // Handle the case where updatedContexts is undefined
          // For example, throw an error or set a default value

          throw new Error('updatedContexts is undefined');
        }

        // Update the array in the database
        await db.ref(ref).set(existingArray);
        return 200; // Successful update
      } else {
        return 404; // Entry not found
      }
    } else {
      return 404; // Array not found or empty
    }
  } catch (error) {
    console.error('## Error updating item (updateJapaneseWord): ', error);
    throw new Error();
  }
};

const addJapaneseWord = async ({ ref, word }) => {
  try {
    // Fetch the existing array
    const snapshot = await db.ref(ref).once('value');
    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array

    // Check if the new item's ID already exists in the array
    const entryID = word.id; // Assuming each entry has a unique 'id' property
    const isDuplicate = newArray.some((item) => item.id === entryID);

    if (!isDuplicate) {
      // Add the new item to the array
      newArray.push(word);

      // Update the entire array
      await db.ref(ref).set(newArray);
      return 200;
    } else {
      return 409;
    }
  } catch (error) {
    console.error('## Error adding item (addJapaneseWord): ', error);
    throw new Error();
  }
};

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

const getSpecifiedFirebaseContent = async ({ ref, id }) => {
  const refs = db.ref(ref);
  try {
    const res = await refs.once('value');
    const japaneseContent = res.val();

    const desiredReference = japaneseContent.find((item) => item?.id === id);

    return desiredReference;
  } catch (error) {
    console.error('Error retrieving posts:', error);
    return error;
  }
};
const getFirebaseContent = async ({ ref }) => {
  const postsRef = db.ref(ref);
  try {
    const res = await postsRef.once('value');
    const japaneseContent = res.val();
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

export {
  uploadBufferToFirebase,
  getFirebaseContent,
  getSpecifiedFirebaseContent,
  addEntry,
  addToSatori,
  addJapaneseWord,
  updateJapaneseWord,
};
