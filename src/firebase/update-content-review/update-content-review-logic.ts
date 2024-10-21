import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';
import { getThisContentsIndex } from '../update-and-create-review';

const updateAndCreateReview = async ({ title, language, fieldToUpdate }) => {
  try {
    const refPath = getRefPath({ language, ref: content });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { keys, index } = getThisContentsIndex({ data, title });

    if (index !== -1) {
      // Firebase paths should be strings
      const key = keys[index];
      const objectRef = refObj.child(key);

      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        title,
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
