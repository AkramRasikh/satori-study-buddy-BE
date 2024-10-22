import { combineAudio } from '../../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import narakeetAudio from '../../narakeet';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content as contentRef } from '../refs';
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

interface UpdateSentenceInContentTypes {
  id: string;
  title: string;
  language: string;
  fieldToUpdate: SentenceFieldToUpdateType;
}

interface UpdateSentenceAudioTypes {
  id: string;
  title: string;
  language: string;
  sentence: string;
  voice?: string;
  content: SentenceType[];
}

const updateSentenceAudio = async ({
  id,
  sentence,
  voice,
  language,
  title,
  content,
}: UpdateSentenceAudioTypes) => {
  const naraKeetRes = await narakeetAudio({
    id,
    sentence,
    voice,
    language,
  });
  if (naraKeetRes) {
    const audioFiles = content.map((item: SentenceType) =>
      getFirebaseAudioURL(item.id),
    );
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

const getPathToSentenceInContent = ({ contentKey, sentenceKey }) =>
  `${contentKey}/${contentRef}/${sentenceKey}`;

const updateSentenceInContent = async ({
  id,
  language,
  title,
  fieldToUpdate,
}: UpdateSentenceInContentTypes) => {
  try {
    const refPath = getRefPath({ language, ref: contentRef });
    const contentSnapshotArr = await getContentTypeSnapshot({
      language,
      ref: contentRef,
      db,
    });

    const { index: contentKey, keys } = getThisContentsIndex({
      data: contentSnapshotArr,
      title,
    });

    if (isFinite(contentKey) && contentKey !== -1) {
      const key = keys[contentKey];
      const thisTopicContent = contentSnapshotArr[key].content;
      const { sentenceKeys, sentenceIndex } = getThisSentenceIndex({
        data: thisTopicContent,
        id,
      });

      if (isFinite(sentenceIndex) && sentenceIndex !== -1) {
        const sentenceKey = sentenceKeys[sentenceIndex];
        const refObj = db
          .ref(refPath)
          .child(getPathToSentenceInContent({ contentKey, sentenceKey }));
        await refObj.update(fieldToUpdate);
        return { updatedFields: fieldToUpdate, content: thisTopicContent };
      } else {
        throw new Error('Error cannot find sentence index');
      }
    } else {
      throw new Error('Error cannot find content index');
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
    if (withAudio && sentence) {
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
    throw new Error(error || 'Issue with updating sentence');
  }
};

export { updateSentenceLogic };
