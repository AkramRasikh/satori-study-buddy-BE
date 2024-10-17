import { Request, Response } from 'express';
import {
  addContentArr,
  addJapaneseWord,
  addMyGeneratedContent,
  addSnippet,
  deleteWord,
  removeSnippet,
} from './init';
import { snippets, content, words, sentences, songs } from './refs';
import { updateAndCreateReview } from './update-and-create-review';
import { updateContentItem } from './update-content-item';
import narakeetAudio from '../narakeet';
import { combineAudio } from '../mp3-utils/combine-audio';
import { getFirebaseAudioURL } from '../mp3-utils/get-audio-url';
import { getLanguageContentData } from './get-language-content-data';
import { addAdhocSentence } from './adhoc-sentence';
import { updateAdhocSentence } from './update-adhoc-sentence';
import { updateWord, updateWordValidation } from './update-word';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';
import { getOnLoadData, getOnLoadDataValidation } from './get-on-load-data';
import { getFirebaseContentType } from './get-firebase-content-type';

const firebaseRoutes = (app) => {
  app.post(
    '/add-snippet',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;
      const contentEntry = req.body?.contentEntry;
      const allowedRefs = [snippets];
      if (!allowedRefs.includes(ref)) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
      }
      try {
        const data = await addSnippet({ ref, language, contentEntry });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );

  app.post(
    '/delete-snippet',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const snippetId = req.body?.snippetId;
      const language = req.body?.language;
      const allowedRefs = [snippets];
      if (!allowedRefs.includes(ref)) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
      }
      try {
        const data = await removeSnippet({ ref, language, snippetId });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );

  app.post(
    '/delete-word',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const wordId = req.body?.wordId;
      const language = req.body?.language;

      if (!wordId) {
        res.status(500).json({ error: 'No wordId (/delete-word)' });
      }
      try {
        const data = await deleteWord({ language, wordId });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );

  app.post(
    '/update-content',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;
      const contentEntry = req.body?.contentEntry;

      if (content !== ref) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
        return;
      }
      try {
        await addContentArr({ ref, language, contentEntry });
        res
          .status(200)
          .json({ message: 'Successfully updated entry', contentEntry });
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );

  app.post(
    '/add-word',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const word = req.body?.word;
      const language = req.body?.language;
      const contexts = req.body?.contexts;

      try {
        const japaneseWordRes = await addJapaneseWord({
          word,
          language,
          contexts,
        });
        if (japaneseWordRes.status === 409) {
          return res
            .status(409)
            .json({ message: 'Entry already exists', word: {} });
        }
        if (japaneseWordRes.status === 200) {
          res.status(200).json({
            message: 'Successfully added entry',
            word: japaneseWordRes.wordData,
          });
        }
      } catch (error) {
        res
          .status(500)
          .json({ error: 'Failed to add item', word: req.body?.word });
      }
    },
  );

  app.post(
    '/firebase-data',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;

      if (
        !(
          ref === content ||
          ref === words ||
          ref === songs ||
          ref === sentences ||
          ref === snippets
        )
      ) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
      }
      try {
        const data = await getFirebaseContentType({ language, ref });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );

  app.post(
    '/update-review',
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

  app.post('/update-word', updateWordValidation, updateWord);

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

  app.post('/on-load-data', getOnLoadDataValidation, getOnLoadData);

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
