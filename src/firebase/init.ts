import admin from 'firebase-admin';
import config from '../../config';
import getBaseForm from '../language-script-helpers/get-base-form';
import { v4 as uuidv4 } from 'uuid';
import { words } from './refs';
import kanjiToHiragana from '../language-script-helpers/kanji-to-hiragana';
import { translate } from '@vitalets/google-translate-api';
import { chatGPTTranslator } from '../open-ai/translator';
import { getRefPath } from '../utils/get-ref-path';

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(config.googleServiceAccount)),
  databaseURL: config.firebaseDBUrl,
});
const bucketName = config.firebaseBucketName;

export const db = admin.database();

const getJapaneseWordDefinition = async (word) => {
  try {
    const { text: definition, raw } = (await translate(word, {
      from: 'ja',
      to: 'en',
    })) as any;

    let transliteration: string[] = [];
    raw.sentences?.forEach((sentence) => {
      if (sentence?.src_translit) {
        transliteration.push(sentence.src_translit);
      }
    });
    const finalTransliteration = transliteration?.join(' ');

    return { definition, transliteration: finalTransliteration };
  } catch (error) {
    const message = error?.message;

    const tooManyRequestsOrVerifyIssues =
      message?.includes('Too Many Requests') ||
      message?.includes('unable to verify');
    if (tooManyRequestsOrVerifyIssues) {
      const openAIKey = process.env.OPENAI_API_KEY;
      return await chatGPTTranslator({ word, model: 'gpt-4', openAIKey });
    }
    throw error;
  }
};

const getContent = async ({ language, ref }) => {
  try {
    const refPath = getRefPath({ language, ref });
    const snapshot = await db.ref(refPath).once('value');
    const data = snapshot.val();
    return data;
  } catch (error) {
    console.error('## getContent', error);
  }
};

const addJapaneseWord = async ({ word, language, contexts }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({
      language,
      ref: words,
    });
    const snapshot = await db.ref(refPath).once('value');

    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array
    const baseForm = await getBaseForm(word);

    // Check if the new item's ID already exists in the array
    const isDuplicate = newArray.some((item) => item.baseForm === baseForm);

    if (!isDuplicate) {
      const { definition, transliteration } = await getJapaneseWordDefinition(
        word,
      );

      const phonetic = await kanjiToHiragana({ sentence: word });

      const wordData = {
        id: uuidv4(),
        baseForm,
        surfaceForm: word,
        phonetic,
        definition,
        transliteration,
        contexts,
      };
      // Add the new item to the array
      newArray.push(wordData);

      // Update the entire array
      await db.ref(refPath).set(newArray);
      return { status: 200, wordData };
    } else {
      return { status: 409 };
    }
  } catch (error) {
    console.error('## Error adding item (addJapaneseWord): ', error);
    throw new Error();
  }
};

const addLyricsToFirestore = async ({ ref, contentEntry }) => {
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
const addMyGeneratedContent = async ({ ref, language, contentEntry }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({
      language,
      ref: words,
    });
    const snapshot = await db.ref(refPath).once('value');
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

// same as above
const addSnippet = async ({ ref, language, contentEntry }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({
      ref,
      language,
    });
    const snapshot = await db.ref(refPath).once('value');
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

const removeSnippet = async ({ ref, language, snippetId }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({
      ref,
      language,
    });
    const snapshot = await db.ref(refPath).once('value');
    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array

    // Get the ID of the content entry to be removed
    const entryID = snippetId; // Assuming each entry has a unique 'id' property

    // Remove the item with the specified ID
    newArray = newArray.filter((item) => item.id !== entryID);

    // Update the entire array
    await db.ref(ref).set(newArray);
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

const deleteWord = async ({ language, wordId }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({
      ref: words,
      language,
    });
    const snapshot = await db.ref(refPath).once('value');
    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array

    // Get the ID of the content entry to be removed
    const entryID = wordId; // Assuming each entry has a unique 'id' property

    // Remove the item with the specified ID
    newArray = newArray.filter((item) => item.id !== entryID);

    // Update the entire array
    await db.ref(refPath).set(newArray);
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

// array!
const addEntry = async ({ ref, contentEntry }) => {
  console.log('## addEntry ref: ', { ref, contentEntry });
  try {
    await db.ref(ref).update(contentEntry);
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

const addContentArr = async ({ ref, language, contentEntry }) => {
  try {
    // Fetch the existing array
    const refPath = getRefPath({ language, ref });
    const snapshot = await db.ref(refPath).once('value');
    let newArray = snapshot.val() || []; // If 'satoriContent' doesn't exist, create an empty array

    // Check if the new item's ID already exists in the array
    const entryTitle = contentEntry.title;
    const isDuplicate = newArray.some((item) => item.title === entryTitle);

    if (!isDuplicate) {
      // Add the new item to the array
      newArray.push(contentEntry);

      // Update the entire array
      await db.ref(refPath).set(newArray);
    } else {
      console.log('## Item already exists in DB');
    }
  } catch (error) {
    console.error('## Error updating database structure:', error);
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
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });
    return url;
  } catch (error) {
    console.error('## Error uploading file to firebase:', error);
  }
};

export {
  uploadBufferToFirebase,
  addEntry,
  addMyGeneratedContent,
  addJapaneseWord,
  addSnippet,
  removeSnippet,
  getContent,
  addLyricsToFirestore,
  addContentArr,
  deleteWord,
};
