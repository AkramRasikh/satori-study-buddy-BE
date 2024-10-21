import { Request, Response } from 'express';
import { updateContentItem } from '../update-content-item';
import narakeetAudio from '../../narakeet';
import { getLanguageContentData } from '../get-language-content-data';
import { getFirebaseAudioURL } from '../../mp3-utils/get-audio-url';
import { combineAudio } from '../../mp3-utils/combine-audio';

const updateSentence = async (req: Request, res: Response) => {
  const sentenceId = req.body?.sentenceId;
  const topicName = req.body?.topicName;
  const fieldToUpdate = req.body?.fieldToUpdate;
  const withAudio = req.body?.withAudio;
  const apiKey = process.env.NARAKEET_KEY;
  const voice = req.body?.voice;
  const language = req.body?.language;
  const sentence = fieldToUpdate?.targetLang;
  try {
    const fieldToUpdateRes = await updateContentItem({
      sentenceId,
      topicName,
      fieldToUpdate,
      language,
    });
    if (withAudio) {
      const naraKeetRes = await narakeetAudio({
        id: sentenceId,
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
  } catch (error) {
    res.status(400).json();
    console.log('## /update-content-item-correction Err', { error });
  }
};

export { updateSentence };
