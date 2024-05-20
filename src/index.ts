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

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

satoriRoutes(app);
openAIRoutes(app);

app.post('/update-content', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const contentEntry = req.body?.contentEntry;
  try {
    await addEntry({ ref, contentEntry });
    res
      .status(200)
      .json({ message: 'Successfully updated entry', contentEntry });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/add-word', async (req: Request, res: Response) => {
  const word = req.body?.word;
  const contexts = req.body?.contexts;
  try {
    const resStatus = await addJapaneseWord({ word, contexts });
    if (resStatus === 409) {
      console.log('## 1');
      return res.status(409).json({ message: 'Entry already exists', word });
    }
    if (resStatus === 200) {
      res.status(200).json({ message: 'Successfully added entry', word });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item', word: req.body?.word });
  }
});

app.post('/firebase-data', async (req: Request, res: Response) => {
  const ref = req.body?.ref;

  if (
    !(
      ref === japaneseContent ||
      ref === japaneseWords ||
      ref === satoriContent ||
      ref === japaneseSentences
    )
  ) {
    res.status(500).json({ error: `Wrong ref added ${ref}` });
  }
  try {
    const data = await getFirebaseContent({ ref });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/satori-data-with-fb', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const sessionToken = req.body?.sessionToken;

  try {
    const satoriResponse = await getSatoriCardsInBulk({
      isDueAndAuto: true,
      sessionToken,
    });

    const data = await satoriResponse.json();

    const satoriData = await Promise.all(
      await structureSatoriFlashcards(data.result, sessionToken),
    );

    const satoriContentInFirebase = await getFirebaseContent({ ref });

    let contextIds = [];

    satoriData.forEach((item) => {
      const textWithKanji = item.textWithKanji;

      satoriContentInFirebase?.forEach((fireBaseItem) => {
        if (
          fireBaseItem?.matchedWords?.includes(textWithKanji) &&
          !contextIds.includes(fireBaseItem.id)
        ) {
          contextIds.push(fireBaseItem.id);
        }
      });
    });

    const contextHelperData =
      satoriContentInFirebase?.filter((item) =>
        contextIds?.includes(item.id),
      ) || [];

    res.status(200).json({ satoriData, contextHelperData });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/satori-content-add', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const contentEntry = req.body?.contentEntry;
  const allowedRefs = [
    japaneseContent,
    japaneseWords,
    satoriContent,
    japaneseSentences,
  ];
  if (!allowedRefs.includes(ref)) {
    res.status(500).json({ error: `Wrong ref added ${ref}` });
  }
  try {
    const data = await addToSatori({ ref, contentEntry });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

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
