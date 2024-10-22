import { combineAudio } from '../../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import narakeetAudio from '../../narakeet';
import { filterOutNestedNulls } from '../../utils/filter-out-nested-nulls';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';
import { SentenceType } from '../types';
import {
  getThisContentsIndex,
  getThisSentenceIndex,
} from '../update-and-create-review';

interface SentenceFieldToUpdateType {
  targetLang?: SentenceType['targetLang'];
  time?: SentenceType['time'];
  notes?: SentenceType['notes'];
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
      const languageContent = filterOutNestedNulls(
        contentSnapshotArr[key].content,
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
  content,
}) => {
  const naraKeetRes = await narakeetAudio({
    id,
    sentence,
    voice,
    language,
  });
  if (naraKeetRes) {
    const audioFiles = content.map((item) => getFirebaseAudioURL(item.id));
    const successfullyRecombinedFiles = await combineAudio({
      audioFiles,
      mp3Name: title,
      language,
    });
    if (successfullyRecombinedFiles) {
      return true;
    } else {
      throw new Error('Issue combining audio');
    }
  }
};

const updateSentenceInContent = async ({
  id,
  language,
  title,
  fieldToUpdate,
}) => {
  try {
    const refPath = getRefPath({ language, ref: content });
    const refObj = db.ref(refPath);
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
      const thisTopicContent = contentSnapshotArr[key].content;
      // two in one refactor needed

      const { sentenceKeys, sentenceIndex } = getThisSentenceIndex({
        data: thisTopicContent,
        id,
      });

      const thisSentenceKey = sentenceKeys[sentenceIndex];
      const objectRef = refObj.child(`${refPath}/${thisSentenceKey}`);
      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        id,
        fieldToUpdate,
      });
      return { updatedFields: fieldToUpdate, content: thisTopicContent };
    } else {
      throw new Error('Error cannot find sentence/content');
    }
  } catch (error) {
    throw new Error('Error updating sentence via content');
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
    const { updatedFields, content } = await updateSentenceInContent({
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
        content,
      });
      return updatedFields;
    } else {
      return updatedFields;
    }
  } catch (error) {
    throw new Error('Issue with updating sentence');
  }
};

export { getLanguageContentData, updateSentenceLogic };
