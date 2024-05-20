import { Request, Response } from 'express';
import narakeetAudio from '.';

const narakeetRoutes = (app) => {
  app.post('/narakeet-audio', async (req: Request, res: Response) => {
    const { body } = req;

    const id = body?.id;
    const apiKey = body?.apiKey;
    const sentence = body?.sentence;
    const voice = body?.voice;

    try {
      const availableMP3Files = await narakeetAudio({
        id,
        apiKey,
        sentence,
        voice,
      });
      if (availableMP3Files) {
        return res.status(200).json({ mp3FilesOnServer: availableMP3Files });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export { narakeetRoutes };
