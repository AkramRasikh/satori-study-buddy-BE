import { db } from './init';

const updateAndCreateReview = async ({ ref, contentEntry, fieldToUpdate }) => {
  try {
    const refObj = db.ref(ref);

    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    // Convert object of objects to an array
    const values = Object.values(data);

    // Find the index of the object to update
    const index = values.findIndex((item) => {
      return (item as any).title === contentEntry;
    });

    if (index !== -1) {
      // Firebase paths should be strings
      const objectRef = refObj.child(`${index}`);

      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        contentEntry,
        fieldToUpdate,
      });
      return {
        contentEntry,
        fieldToUpdate,
      };
    } else {
      console.log('## updateAndCreateReview Object not found');
    }
  } catch (error) {
    console.error('## updateAndCreateReview error:', error);
  }
};

export { updateAndCreateReview };
