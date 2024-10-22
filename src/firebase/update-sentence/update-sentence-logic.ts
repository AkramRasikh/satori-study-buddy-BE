import { combineAudio } from '../../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import narakeetAudio from '../../narakeet';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { db } from '../init';
import { content } from '../refs';
import { SentenceType } from '../types';
import { getThisContentsIndex } from '../update-and-create-review';
import { updateContentItem } from '../update-content-item';

interface SentenceFieldToUpdateType {
  targetLang?: SentenceType['targetLang'];
  time?: SentenceType['time'];
}

interface UpdateSentenceLogicTypes {
  id: string;
  title: string;
  language: string;
  fieldToUpdate: SentenceFieldToUpdateType;
  withAudio?: boolean;
  sentence?: string;
  voice?: string;
}

const getLanguageContentData = async ({ language, title }) => {
  try {
    const contentSnapshotArr = await getContentTypeSnapshot({
      language,
      ref: content,
      db,
    });

    const { index, keys } = getThisContentsIndex({
      data: contentSnapshotArr,
      title,
    });

    if (index !== -1) {
      const key = keys[index];
      const languageContent = contentSnapshotArr[key].content.filter(
        (i) => i !== null,
      );

      return languageContent;
    } else {
      throw new Error(`Can't find ${language} ${content} index for ${title}`);
    }
  } catch (error) {
    throw new Error(
      `Error querying getting language content data. ${language}, ${content}, ${title}`,
    );
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
}: UpdateSentenceLogicTypes) => {
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
    } else {
      return fieldToUpdateRes;
    }
  } catch (error) {
    throw new Error('Issue with updating sentence');
  }
};

export { getLanguageContentData, updateSentenceLogic };
