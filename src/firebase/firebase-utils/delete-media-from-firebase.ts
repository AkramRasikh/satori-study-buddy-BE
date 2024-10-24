import config from '../../../config';
import { admin } from '../init';

const deleteFileFromFirebase = async (filePath) => {
  const storage = admin.storage();
  const bucketName = config.firebaseBucketName;
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    await file.delete();
    return true;
  } catch (error) {
    throw new Error('Failed to delete file from firebase');
  }
};

export { deleteFileFromFirebase };
