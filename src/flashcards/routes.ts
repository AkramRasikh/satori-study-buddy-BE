import { Request, Response } from 'express';
import { getCollectionOfWordData, getJapaneseWordsViaTopic } from '.';

const flashcardRoutes = async (app) => {
  app.get('/get-japanese-words', async (req: Request, res: Response) => {
    try {
      const collectionOfWordData = await getCollectionOfWordData();
      res.send(collectionOfWordData).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });

  app.post('/get-japanese-words-topic', async (req: Request, res: Response) => {
    const topic = req.body?.topic;
    try {
      const thisTopicsWords = await getJapaneseWordsViaTopic({ topic });
      res.send(thisTopicsWords).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });
};

export { flashcardRoutes };
