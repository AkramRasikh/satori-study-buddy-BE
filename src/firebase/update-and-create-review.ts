import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';

export const getThisContentsIndex = ({ data, contentEntry }) => {
  // Convert object of objects to an array
  const values = Object.values(data);
  const keys = Object.keys(data);

  // Find the index of the object to update
  const index = values.findIndex((item) => {
    return (item as any).title === contentEntry;
  });

  return { keys, index };
};

export const getThisSentenceIndex = ({ data, id }) => {
  // Convert object of objects to an array
  const values = Object.values(data);
  const sentenceKeys = Object.keys(data);

  // Find the index of the object to update
  const sentenceIndex = values.findIndex((item) => {
    return (item as any).id === id;
  });

  return { sentenceKeys, sentenceIndex };
};
const updateAndCreateReview = async ({
  ref,
  contentEntry,
  language,
  fieldToUpdate,
}) => {
  try {
    const refPath = getRefPath({ language, ref });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { keys, index } = getThisContentsIndex({ data, contentEntry });

    if (index !== -1) {
      // Firebase paths should be strings
      const key = keys[index];
      const objectRef = refObj.child(key);

      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        contentEntry,
        fieldToUpdate,
      });
      return fieldToUpdate;
    } else {
      console.log('## updateAndCreateReview Object not found');
      return false;
    }
  } catch (error) {
    console.error('## updateAndCreateReview error:', error);
  }
};

export { updateAndCreateReview };
