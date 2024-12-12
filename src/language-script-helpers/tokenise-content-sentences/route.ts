import { Request, Response } from 'express';
import { tokenizeSentence } from '../kanji-to-hiragana';
import { content as contentRef } from '../../firebase/refs';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { db } from '../../firebase/init';
import {
  getThisContentsIndex,
  getThisSentenceIndex,
} from '../../firebase/firebase-utils/get-content-sentence-index-keys';
import { validationResult } from 'express-validator';
import { getRefPath } from '../../utils/get-ref-path';
import { getPathToSentenceInContent } from '../../firebase/update-sentence/update-sentence-logic';

const tokeniseContentSentences = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const language = req.body?.language;
  const sliceStart = req.body?.sliceStart;
  const sliceEnd = req.body?.sliceEnd;
  try {
    const refPath = getRefPath({ language, ref: contentRef });
    const contentSnapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: contentRef,
        db,
      })) || [];

    const data = [];
    const promiseAllRes = await Promise.all(
      contentSnapshotArr
        .slice(sliceStart, sliceEnd)
        .map(async (contentWidget) => {
          const title = contentWidget.title;
          const { index: contentKey, keys } = getThisContentsIndex({
            data: contentSnapshotArr,
            title,
          });

          if (isFinite(contentKey) && contentKey !== -1) {
            const key = keys[contentKey];
            const thisTopicContent = contentSnapshotArr[key].content;
            const tokenisedSentences = await Promise.all(
              await thisTopicContent.map(async (sentenceData) => {
                const { sentenceKeys, sentenceIndex } = getThisSentenceIndex({
                  data: thisTopicContent,
                  id: sentenceData.id,
                });
                const sentenceKey = sentenceKeys[sentenceIndex];

                const tokenisedObj = {
                  tokenised: await tokenizeSentence({
                    sentence: sentenceData.targetLang,
                  }),
                };
                const refObj = db
                  .ref(refPath)
                  .child(
                    getPathToSentenceInContent({ contentKey, sentenceKey }),
                  );
                await refObj.update(tokenisedObj);
                return {
                  ...sentenceData,
                  tokenised: await tokenizeSentence({
                    sentence: sentenceData.targetLang,
                  }),
                };
              }),
            );
            data.push(tokenisedSentences);
          }
        }),
    );
    if (promiseAllRes.length > 0) {
      res.status(200).json({ data });
    } else {
      res.status(400).json({ error: 'Failed to updated tokenised data' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export { tokeniseContentSentences };
