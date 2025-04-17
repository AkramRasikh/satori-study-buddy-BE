import { Request, Response } from 'express';
import { updateSentenceBulkLogic } from './update-sentence-bulk-logic';
import { validationResult } from 'express-validator';
import { getRefPath } from '../../utils/get-ref-path';
import { content } from '../refs';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getThisContentsIndex } from '../firebase-utils/get-content-sentence-index-keys';
import { db } from '../init';

const updateSentenceBulk = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { language, title, fieldToUpdate, removeReview } = req.body;

  try {
    const data = await updateSentenceBulkLogic({
      title,
      language,
      fieldToUpdate,
      removeReview,
    });
    res.status(200).json({ content: data });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error?.message || 'Error updating sentence' });
  }
};

const updateSentenceBulkAll = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { language, topics } = req.body;

  try {
    try {
      const refPath = getRefPath({ language, ref: content });
      const contentSnapshotArr = await getContentTypeSnapshot({
        language,
        ref: content,
        db,
      });

      const updatedContentArr = [];
      await Promise.all(
        topics.map(async (contentTitleKey) => {
          const { keys, index } = getThisContentsIndex({
            data: contentSnapshotArr,
            title: contentTitleKey,
          });

          if (index !== -1) {
            const key = keys[index];
            const thisTopicData = contentSnapshotArr[key];
            const thisTopicContent = thisTopicData.content;
            const contentWithUpdatedReviewData = thisTopicContent.map(
              (sentenceWidget) => {
                if (sentenceWidget?.reviewData) {
                  const { reviewData, ...rest } = sentenceWidget;
                  return {
                    ...rest,
                  };
                }
                return sentenceWidget;
              },
            );
            const refObj = db.ref(refPath);
            const objectRef = refObj.child(key);
            await objectRef.update({ content: contentWithUpdatedReviewData });
            updatedContentArr.push(contentTitleKey);
          } else {
            throw new Error("Couldn't find content to update");
          }
        }),
      );
      res.status(200).json(updatedContentArr);
    } catch (error) {
      throw new Error('Error updating content metadata');
    }
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error?.message || 'Error updating sentence' });
  }
};

export { updateSentenceBulk, updateSentenceBulkAll };
