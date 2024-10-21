import { Request, Response, Express } from 'express';
import { addMyGeneratedContent } from './init';
import { snippets, content, words, sentences, songs } from './refs';
import { updateAndCreateReview } from './update-and-create-review';
import { updateContentItem } from './update-content-item';
import narakeetAudio from '../narakeet';
import { combineAudio } from '../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../mp3-utils/get-audio-url';
import { getLanguageContentData } from './get-language-content-data';
import { addAdhocSentence } from './adhoc-sentence';
import { updateAdhocSentence } from './update-adhoc-sentence';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';
import { getFirebaseContentType } from './get-firebase-content-type';
import { updateWordValidation } from './update-word/validation';
import { updateWord } from './update-word/route';
import { getOnLoadDataValidation } from './get-on-load-data/validation';
import { getOnLoadData } from './get-on-load-data/route';
import { addSnippet } from './add-snippet/route';
import { addSnippetValidation } from './add-snippet/validation';
import { deleteSnippet } from './delete-snippet/route';
import { deleteSnippetValidation } from './delete-snippet/validation';
import { deleteWordValidation } from './delete-word/validation';
import { deleteWord } from './delete-word/route';
import { addContent } from './add-content/route';
import { addContentValidation } from './add-content/validation';
import { addWord } from './add-word/route';
import { addWordValidation } from './add-word/validation';

const firebaseRoutes = (app: Express) => {
  app.post('/update-word', updateWordValidation, updateWord);
  app.post('/on-load-data', getOnLoadDataValidation, getOnLoadData);
  app.post('/add-snippet', addSnippetValidation, addSnippet);
  app.post('/delete-snippet', deleteSnippetValidation, deleteSnippet);
  app.post('/delete-word', deleteWordValidation, deleteWord);
  app.post('/add-content', addContentValidation, addContent);
  app.post('/add-word', addWordValidation, addWord);
  app.post(
    '/update-content-review',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;
      const contentEntry = req.body?.contentEntry;
      const fieldToUpdate = req.body?.fieldToUpdate;

      try {
        const fieldToUpdateRes = await updateAndCreateReview({
          ref,
          contentEntry,
          fieldToUpdate,
          language,
        });
        if (fieldToUpdateRes) {
          res.status(200).json(fieldToUpdateRes);
        } else {
          res.status(400).json({ message: 'Not found' });
        }
      } catch (error) {
        res.status(400).json();
        console.log('## /update-review Err', { error });
      }
    },
  );

  // only for when the targetLang is being updated
  app.post(
    '/update-content-item-correction',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
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
    },
  );

  app.post(
    '/add-adhoc-sentence',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const adhocSentence = req.body.adhocSentence;
      const nextReview = req.body.nextReview;
      const tags = req.body?.tags;
      const topic = req.body?.topic;
      const language = req.body?.language;

      try {
        const result = await addAdhocSentence({
          language,
          adhocSentence,
          tags,
          topic,
          nextReview,
        });
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: 'Failed to add sentence' });
      }
    },
  );

  app.post(
    '/update-content-item',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const sentenceId = req.body?.sentenceId;
      const language = req.body?.language;
      const topicName = req.body?.topicName;
      const fieldToUpdate = req.body?.fieldToUpdate;

      try {
        const fieldToUpdateRes = await updateContentItem({
          language,
          sentenceId,
          topicName,
          fieldToUpdate,
        });
        if (fieldToUpdateRes) {
          res.status(200).json(fieldToUpdateRes);
        } else {
          res.status(400).json({ message: 'Not found' });
        }
      } catch (error) {
        res.status(400).json();
        console.log('## /update-review Err', { error });
      }
    },
  );

  app.post(
    '/update-adhoc-sentence',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const sentenceId = req.body?.sentenceId;
      const language = req.body?.language;
      const fieldToUpdate = req.body?.fieldToUpdate;

      try {
        const fieldToUpdateRes = await updateAdhocSentence({
          sentenceId,
          fieldToUpdate,
          language,
        });
        if (fieldToUpdateRes) {
          res.status(200).json(fieldToUpdateRes);
        } else {
          res.status(400).json({ message: 'Not found' });
        }
      } catch (error) {
        res.status(400).json();
        console.log('## /update-adhoc-sentence Err', { error });
      }
    },
  );

  app.post(
    '/add-my-generated-content',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;
      const contentEntry = req.body?.contentEntry;
      const allowedRefs = [content, words, sentences];
      if (!allowedRefs.includes(ref)) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
      }
      try {
        const data = await addMyGeneratedContent({
          ref,
          language,
          contentEntry,
        });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );
};

export { firebaseRoutes };
