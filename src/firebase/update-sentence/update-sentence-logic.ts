import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content as contentRef } from '../refs';
import { SentenceType } from '../types';
import {
  getThisContentsIndex,
  getThisSentenceIndex,
} from '../firebase-utils/get-content-sentence-index-keys';

interface VocabTypes {
  surfaceForm: string;
  meaning: string;
}

interface SentenceFieldToUpdateType {
  targetLang?: SentenceType['targetLang'];
  time?: SentenceType['time'];
  notes?: SentenceType['notes'];
  sentenceStructure?: string;
  vocab?: VocabTypes[];
  meaning?: string;
}

interface UpdateSentenceInContentTypes {
  id: string;
  title: string;
  language: string;
  fieldToUpdate: SentenceFieldToUpdateType;
}

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
    throw new Error(error || 'Error updating sentence via content');
  }
};

export { updateSentenceInContent, getPathToSentenceInContent };
