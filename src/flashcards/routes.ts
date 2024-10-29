import { Request, Response } from 'express';
import { getJapaneseWordsViaTopic, getTopicsWithFlashWordsToStudy } from '.';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';

const flashcardRoutes = async (app) => {
  app.post(
    '/topics-to-study',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const language = req.body?.language;

      try {
        const topicsWithFlashWordsToStudy =
          await getTopicsWithFlashWordsToStudy({
            language,
          });
        res.send(topicsWithFlashWordsToStudy).status(200);
      } catch (error) {
        console.log('## error /topics-to-study', error);
      }
    },
  );

  app.post(
    '/get-words-topic',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const topic = req.body?.topic;
      const language = req.body?.language;
      try {
        const thisTopicsWords = await getJapaneseWordsViaTopic({
          language,
          topic,
        });
        res.send(thisTopicsWords).status(200);
      } catch (error) {
        console.log('## error /get-words-topic', error);
      }
    },
  );
};

export { flashcardRoutes };
