import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';

const addSnippetLogic = async ({ ref, language, contentEntry }) => {
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

export { addSnippetLogic };
