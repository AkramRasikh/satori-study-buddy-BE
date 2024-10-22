import { combineAudio } from '../../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import narakeetAudio from '../../narakeet';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';
import { getThisContentsIndex } from '../update-and-create-review';
import { updateContentItem } from '../update-content-item';

const getLanguageContentData = async ({ language, title }) => {
  try {
    const refPath = getRefPath({
      language,
      ref: content,
    });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { index, keys } = getThisContentsIndex({
      data,
      title,
    });

    if (index !== -1) {
      const key = keys[index];
      const languageContent = data[key].content.filter((i) => i !== null);

      return languageContent;
    } else {
      return null;
    }
  } catch (error) {
    console.error('## updateContentItem error:', error);
  }
};

const updateSentenceAudio = async ({
  id,
  sentence,
  voice,
  language,
  title,
}) => {
  const naraKeetRes = await narakeetAudio({
    id,
    sentence,
    voice,
  });
  if (naraKeetRes) {
    const languageContent = await getLanguageContentData({
      language,
      title,
    });
    const audioFiles = languageContent.map((item) =>
      getFirebaseAudioURL(item.id),
    );
    const successfullyRecombinedFiles = combineAudio({
      audioFiles,
      mp3Name: title,
    }); // wrap in promise

    // delete snippets if they exists
    if (successfullyRecombinedFiles) {
      return true;
    } else {
      throw new Error('Issue combining audio');
    }
  }
};

const updateSentenceLogic = async ({
  id,
  title,
  fieldToUpdate,
  sentence,
  voice,
  language,
  withAudio,
}) => {
  try {
    const fieldToUpdateRes = await updateContentItem({
      id,
      title,
      fieldToUpdate,
      language,
    });
    if (withAudio) {
      await updateSentenceAudio({
        id,
        sentence,
        voice,
        language,
        title,
      });
      return fieldToUpdateRes;
    }
  } catch (error) {
    throw new Error('Issue with updating sentence');
  }
};

export { getLanguageContentData, updateSentenceLogic };
