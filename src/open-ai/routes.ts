import { Request, Response } from 'express';
import chatGptTextAPI from './chat-gpt';
import chatGPTTextToSpeech from './chat-gpt-tts';
import { combineWords } from './combine-words/route';
import { combineWordsValidation } from './combine-words/validation';
import { baseRoute } from '../shared-express-utils/base-route';

const openAIRoutes = (app) => {
  app.post('/chat-gpt-text', async (req: Request, res: Response) => {
    const { body } = req;
    const openAIKey = body?.openAIKey;
    const sentence = body?.sentence;
    const model = body?.model;
    try {
      const resultContent = await chatGptTextAPI({
        sentence,
        model,
        openAIKey,
      });
      console.log('## /chat-gpt-text success');
      res.status(200).json(resultContent);
    } catch (error) {
      console.log('## yooooo Errror');
      res.status(500).json({ error });
    }
  });

  app.post('/combine-words', combineWordsValidation, baseRoute, combineWords);

  app.post('/chat-gpt-tts', async (req: Request, res: Response) => {
    const { body } = req;
    const openAIKey = body?.openAIKey;
    const sentence = body?.sentence;
    const id = body?.id;

    try {
      const successResIdSentence = await chatGPTTextToSpeech({
        openAIKey,
        sentence,
        id,
      });

      return res.status(200).json({ mp3FilesOnServer: successResIdSentence });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export { openAIRoutes };
