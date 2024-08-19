import { db } from './init';

const updateAndCreateReview = async ({ ref, contentEntry, fieldToUpdate }) => {
  try {
    const refObj = db.ref(ref);

    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    // Convert object of objects to an array
    const values = Object.values(data);
    const keys = Object.keys(data);

    // Find the index of the object to update
    const index = values.findIndex((item) => {
      return (item as any).title === contentEntry;
    });

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
