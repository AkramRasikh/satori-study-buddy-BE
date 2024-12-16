import { Request, Response } from 'express';
import chatGPTTextToSpeech from '../chat-gpt-tts';
import { sentences } from '../../firebase/refs';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../../firebase/init';

const sentenceTTS = async (req: Request, res: Response) => {
  const { body } = req;
  const id = body.id;
  const sentence = body.sentence;
  const language = body.language;

  try {
    const successResIdSentence = await chatGPTTextToSpeech({
      sentence,
      id,
      language,
    });

    const sentenceSnapshotArr = await getContentTypeSnapshot({
      language,
      ref: sentences,
      db,
    });

    const thisSentenceFromSnapshotIndex = sentenceSnapshotArr.findIndex(
      (item) => item.id === id,
    );

    if (thisSentenceFromSnapshotIndex !== -1) {
      const refPathWithIndex = `${getRefPath({
        language,
        ref: sentences,
      })}/${thisSentenceFromSnapshotIndex}`;
      const refObj = db.ref(refPathWithIndex);
      await refObj.update({ hasAudio: true });
      return res.status(200).json(successResIdSentence);
    } else {
      res.status(400).json({ error: "Couldn't find sentence to update" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { sentenceTTS };
