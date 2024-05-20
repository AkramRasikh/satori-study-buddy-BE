import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import config from '../config';
import narakeetAudio from './narakeet';
import getSatoriCardsInBulk from './satori/bulk-cards';
import {
  getFirebaseContent,
  addEntry,
  addToSatori,
  addJapaneseWord,
} from './firebase/init';
import {
  japaneseContent,
  japaneseWords,
  satoriContent,
  japaneseSentences,
} from './firebase/refs';
import { structureSatoriFlashcards } from './satori/structure-satori-data';
import { satoriRoutes } from './satori/routes';
import { openAIRoutes } from './open-ai/routes';
import { firebaseRoutes } from './firebase/routes';
import { languageScriptHelpers } from './language-script-helpers/routes';

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

satoriRoutes(app);
openAIRoutes(app);
firebaseRoutes(app);
languageScriptHelpers(app);

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

app.listen(port, () => {
  console.log(`## Server is running at http://localhost:${port}`);
  console.log('## port: ', port);
});
