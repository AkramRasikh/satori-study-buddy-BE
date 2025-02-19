import { getAudioFolderViaLang } from '../../utils/get-audio-folder-via-language';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { deleteFileFromFirebase } from '../firebase-utils/delete-media-from-firebase';
import { db } from '../init';
import { content } from '../refs';

// cases (can do on FE):
// 1. delete content from content
// 2. delete content that has snippets - will they be reviewable?
// 3. delete content that has reviewed sentences - transfer to seperate sentences?
// 4. delete content that has words
// 5. media assets

const getMediaFilePath = ({ language, fileName }) =>
  getAudioFolderViaLang(language) + '/' + fileName + '.mp3';

const deleteAllContentLogic = async ({ language, url }) => {
  try {
    const refPath = getRefPath({
      ref: content,
      language,
    });
    const contentSnapshot = await getContentTypeSnapshot({
      language,
      ref: content,
      db,
    });

    const updatedContentArr = contentSnapshot.filter(
      (item) => item.url !== url,
    );
    const titlesOfFiles = contentSnapshot.filter((item) => item.url !== url);

    const allDeletedSuccessful = await Promise.all(
      titlesOfFiles.map(async (content) => {
        const filePath = getMediaFilePath({
          language,
          fileName: content.title,
        });
        await db.ref(refPath).set(updatedContentArr);
        await deleteFileFromFirebase(filePath);
      }),
    );
    return allDeletedSuccessful;
  } catch (error) {
    throw new Error(error || `Error deleting content (logic) for ${language}`);
  }
};

const deleteContentLogic = async ({ language, title }) => {
  try {
    const refPath = getRefPath({
      ref: content,
      language,
    });
    const contentSnapshot = await getContentTypeSnapshot({
      language,
      ref: content,
      db,
    });
    const updatedContentArr = contentSnapshot.filter(
      (item) => item.title !== title,
    );
    const filePath = getMediaFilePath({ language, fileName: title });
    await db.ref(refPath).set(updatedContentArr);
    await deleteFileFromFirebase(filePath);
  } catch (error) {
    throw new Error(error || `Error deleting content (logic) for ${language}`);
  }
};

export { deleteContentLogic, deleteAllContentLogic };
