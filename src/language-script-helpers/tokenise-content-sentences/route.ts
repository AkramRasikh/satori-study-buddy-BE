import { Request, Response } from 'express';
import { tokenizeSentence } from '../kanji-to-hiragana';
import { content as contentRef } from '../../firebase/refs';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { db } from '../../firebase/init';
import { getThisContentsIndex } from '../../firebase/firebase-utils/get-content-sentence-index-keys';
import { validationResult } from 'express-validator';

const tokeniseContentSentences = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const title = req.body?.title;
  const language = req.body?.language;
  try {
    // const refPath = getRefPath({ language, ref: contentRef });
    const contentSnapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: contentRef,
        db,
      })) || [];

    const { index: contentKey, keys } = getThisContentsIndex({
      data: contentSnapshotArr,
      title,
    });

    if (isFinite(contentKey) && contentKey !== -1) {
      const key = keys[contentKey];
      const thisTopicContent = contentSnapshotArr[key].content;
      const tokenisedSentences = await Promise.all(
        await thisTopicContent.map(async (sentenceData) => {
          return {
            targetLang: sentenceData.targetLang,
            tokenised: await tokenizeSentence({
              sentence: sentenceData.targetLang,
            }),
          };
        }),
      );

      res.status(200).json({ sentences: tokenisedSentences });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export { tokeniseContentSentences };
