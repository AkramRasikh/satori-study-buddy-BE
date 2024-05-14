import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import config from '../config';
import chatGptTextAPI from './open-ai/chat-gpt';
import chatGPTTextToSpeech from './open-ai/chat-gpt-tts';
import kanjiToHiragana from './language-script-helpers/kanji-to-hiragana';
import satoriFlashcard from './satori/flashcard';
import narakeetAudio from './narakeet';
import getSatoriCardsInBulk from './satori/bulk-cards';
import getSatoriSentence from './satori/audio';
import underlineTargetWords from './language-script-helpers/underline-target-words';
import {
  getFirebaseContent,
  addEntry,
  addToSatori,
  getSpecifiedFirebaseContent,
  addJapaneseWord,
  updateJapaneseWord,
  deleteJapaneseWord,
} from './firebase/init';
import { japaneseContent, japaneseWords, satoriContent } from './firebase/refs';
import { structureSatoriFlashcards } from './satori/structure-satori-data';
import { satoriRoutes } from './satori/routes';

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

satoriRoutes(app);

app.post('/chat-gpt-text', async (req: Request, res: Response) => {
  const { body } = req;
  const openAIKey = body?.openAIKey;
  const sentence = body?.sentence;
  const model = body?.model;
  try {
    const resultContent = await chatGptTextAPI({ sentence, model, openAIKey });
    console.log('## /chat-gpt-text success');
    res.status(200).json(resultContent);
  } catch (error) {
    console.log('## yooooo Errror');
    res.status(500).json({ error });
  }
});

app.post('/kanji-to-hiragana', async (req: Request, res: Response) => {
  const preHiraganaText = req.body?.sentence;
  try {
    const hiraganaTextSentence = await kanjiToHiragana({
      sentence: preHiraganaText,
    });

    res.status(200).json({ sentence: hiraganaTextSentence });
  } catch (error) {
    res.status(500).json({ error });
  }
});

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
  const ref = req.body?.ref;
  const word = req.body?.word;
  try {
    const resStatus = await addJapaneseWord({ ref, word });
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

app.post('/update-word', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const word = req.body?.word;

  try {
    const resStatus: any = await updateJapaneseWord({ ref, word });
    if (resStatus === 404) {
      return res
        .status(404)
        .json({ message: 'Entry does not exists to update', word });
    }
    if (resStatus === 200) {
      res.status(200).json({ message: 'Successfully updated entry', word });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to update item', word: req.body?.word });
  }
});

app.post('/delete-word', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const word = req.body?.word;

  try {
    // for now
    const resStatus = await deleteJapaneseWord({ ref, id: word.id });
    if (resStatus === 404) {
      return res.status(404).json({ message: "Entry doesn't exist", word });
    }
    if (resStatus === 200) {
      res.status(200).json({ message: 'Successfully deleted entry', word });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to delete item', word: req.body?.word });
  }
});

app.post('/firebase-data', async (req: Request, res: Response) => {
  const ref = req.body?.ref;

  if (
    !(ref === japaneseContent || ref === japaneseWords || ref === satoriContent)
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

app.post('/firebase-data-entry', async (req: Request, res: Response) => {
  const ref = req.body?.ref;
  const id = req.body?.id;

  if (
    !(ref === japaneseContent || ref === japaneseWords || ref === satoriContent)
  ) {
    res.status(500).json({ error: `Wrong ref added ${ref}` });
  }
  try {
    const data = await getSpecifiedFirebaseContent({ ref, id });
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

  if (
    !(ref === japaneseContent || ref === japaneseWords || ref === satoriContent)
  ) {
    res.status(500).json({ error: `Wrong ref added ${ref}` });
  }
  try {
    const data = await addToSatori({ ref, contentEntry });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/underline-target-words', async (req: Request, res: Response) => {
  // need to check body before functions
  const preUnderlinedSentence = req.body.sentence;
  const wordBank = req.body.wordBank;
  try {
    const hiraganaTextSentence = await underlineTargetWords({
      preUnderlinedSentence,
      wordBank,
    });
    console.log('## hiraganaTextSentence: ', hiraganaTextSentence);

    res.status(200).json({ underlinedText: hiraganaTextSentence });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/satori-audio', async (req: Request, res: Response) => {
  const sessionToken = req.body?.sessionToken;
  const id = req.body?.id;
  const episode = req.body?.episode;

  try {
    const audioUrl = await getSatoriSentence({
      id,
      episode,
      sessionToken,
    });
    if (audioUrl) {
      res.status(200).json({ url: audioUrl });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

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
