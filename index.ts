import express, { Request, Response } from 'express';
import path from 'path';
import config from './config';
import chatGptTextAPI from './open-ai/chat-gpt';
import chatGPTTextToSpeech from './open-ai/chat-gpt-tts';

const app = express();

// Use config values
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST endpoint to handle requests
app.post('/api/endpoint', (req: Request, res: Response) => {
  const { body } = req;
  console.log('## Received body:', body.meow);
  res.json({ message: 'Request received successfully', data: body });
});
app.post('/chat-gpt-text', async (req: Request, res: Response) => {
  const { body } = req;
  const sessionKey = body?.sessionKey;
  const sentence = body?.sentence;
  const model = body?.model;
  try {
    const resultContent = await chatGptTextAPI({ sentence, model, sessionKey });
    res.status(200).json(resultContent);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/chat-gpt-tts', async (req: Request, res: Response) => {
  const { body } = req;
  const sessionKey = body?.sessionKey;
  const sentence = body?.sentence;
  const id = body?.id;

  try {
    const availableMP3Files = await chatGPTTextToSpeech({
      sessionKey,
      sentence,
      id,
    });

    return res.status(200).json(availableMP3Files);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`## Server is running at http://localhost:${port}`);
  console.log('## port: ', port);
});
