import { Request, Response } from 'express';
import { updateContentItem } from '../update-content-item';
import narakeetAudio from '../../narakeet';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import { combineAudio } from '../../mp3-utils/combine-audio';
import { getLanguageContentData } from './update-sentence-logic';
import { validationResult } from 'express-validator';

const updateSentence = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.body.id;
  const topicName = req.body.title;
  const fieldToUpdate = req.body.fieldToUpdate;
  const withAudio = req.body.withAudio;
  const apiKey = process.env.NARAKEET_KEY;
  const voice = req.body.voice;
  const language = req.body.language;
  const sentence = fieldToUpdate.targetLang;
  try {
    const fieldToUpdateRes = await updateContentItem({
      id,
      topicName,
      fieldToUpdate,
      language,
    });
    if (withAudio) {
      const naraKeetRes = await narakeetAudio({
        id,
        apiKey,
        sentence,
        voice,
      });
      if (naraKeetRes) {
        const languageContent = await getLanguageContentData({
          language,
          topicName,
        });
        const audioFiles = languageContent.map((item) =>
          getFirebaseAudioURL(item.id),
        );
        const combineAudioRes = combineAudio({
          audioFiles,
          mp3Name: topicName,
        }); // returns fluentpackage object
        // delete snippets if they exists
        if (combineAudioRes) {
          res.status(200).json(fieldToUpdateRes);
        } else {
          res.status(400).json({ message: 'Issue combining' });
        }
      } else {
        res.status(400).json({ message: 'Not found' });
      }
    } else {
      res.status(200).json(fieldToUpdateRes);
    }
  } catch (error: any) {
    console.log('## /update-content-item-correction Err', { error });
    res
      .status(400)
      .json({ error: error?.message || 'Error updating sentence' });
  }
};

export { updateSentence };
