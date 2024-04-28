import express, { Request, Response } from 'express';
import path from 'path';
import config from './config';
import chatGptTextAPI from './open-ai/chat-gpt';

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
  const sessionKey = body?.sessionKey; // subject to change
  const sentence = body?.sentence; // subject to change
  const model = body?.model; // subject to change
  const resultContent = await chatGptTextAPI(sentence, model, sessionKey);
  console.log('## resultContent: ', resultContent);
  res.json({ message: 'Request received successfully', data: body });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('## port: ', port);
});
