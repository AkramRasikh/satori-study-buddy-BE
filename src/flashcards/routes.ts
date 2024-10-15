import { Request, Response } from 'express';
import {
  getJapaneseWordsViaSong,
  getJapaneseWordsViaTopic,
  getTopicsWithFlashWordsToStudy,
} from '.';

const flashcardRoutes = async (app) => {
  app.post('/topics-to-study', async (req: Request, res: Response) => {
    const language = req.body?.language;

    try {
      const topicsWithFlashWordsToStudy = await getTopicsWithFlashWordsToStudy({
        language,
      });
      res.send(topicsWithFlashWordsToStudy).status(200);
    } catch (error) {
      console.log('## error /topics-to-study', error);
    }
  });

  app.post('/get-japanese-words-topic', async (req: Request, res: Response) => {
    const topic = req.body?.topic;
    const language = req.body?.language;
    try {
      const thisTopicsWords = await getJapaneseWordsViaTopic({
        language,
        topic,
      });
      res.send(thisTopicsWords).status(200);
    } catch (error) {
      console.log('## error /get-japanese-words-topic', error);
    }
  });

  app.post('/get-japanese-words-song', async (req: Request, res: Response) => {
    const topic = req.body?.topic;
    const language = req.body?.language;

    try {
      const thisTopicsWords = await getJapaneseWordsViaSong({
        topic,
        language,
      });
      res.send(thisTopicsWords).status(200);
    } catch (error) {
      console.log('## error /get-japanese-words-song', error);
    }
  });
};

export { flashcardRoutes };
