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

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/satori-cards-bulk', async (req: Request, res: Response) => {
  const { body } = req;
  const isDueAndAuto = body?.isDueAndAuto;
  const sessionToken = body?.sessionToken;
  try {
    const response = await getSatoriCardsInBulk({ isDueAndAuto, sessionToken });

    const data = await response.json();

    if (!data.success) {
      res.status(401).json({ message: data.message });
    }

    console.log('## /satori-cards-bulk success');
    res.status(200).json({
      message: 'Satori cards successfully retrieved',
      data: data.result,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

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

app.post('/satori-flashcard', async (req: Request, res: Response) => {
  const sessionToken = req.body?.sessionToken;
  const flashCardDifficulty = req.body?.flashCardDifficulty;
  const cardId = req.body?.cardId;

  try {
    const flashcardResponseSuccess = await satoriFlashcard({
      sessionToken,
      flashCardDifficulty,
      cardId,
    });

    if (flashcardResponseSuccess) {
      // send text too?
      res.status(200).json({ cardId });
    }
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
    const availableMP3Files = await chatGPTTextToSpeech({
      openAIKey,
      sentence,
      id,
    });

    return res.status(200).json({ mp3FilesOnServer: availableMP3Files });
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
