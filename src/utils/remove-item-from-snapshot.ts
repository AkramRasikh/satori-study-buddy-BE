import { getContentTypeSnapshot } from './get-content-type-snapshot';
import { getRefPath } from './get-ref-path';

const removeFromSnapshot = async ({ ref, language, id, db }) => {
  try {
    const refPath = getRefPath({
      ref,
      language,
    });
    const snapshotArr = await getContentTypeSnapshot({
      ref,
      language,
      db,
    });
    let deletedItem;
    const updatedSnapShot =
      snapshotArr?.length > 0
        ? snapshotArr.filter((item) => {
            if (item.id !== id) {
              return true;
            }
            deletedItem = item;
            return false;
          })
        : [];

    await db.ref(refPath).set(updatedSnapShot);
    return deletedItem;
  } catch (error) {
    throw new Error(`Error removing item from db: ${language} ${ref}`);
  }
};

export { removeFromSnapshot };
