import express, { Request, Response } from 'express';
import path from 'path';
import config from './config';

const app = express();

// Use config values
const port = config.port;
const apiKey = config.apiKey;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// POST endpoint to handle requests
app.post('/api/endpoint', (req: Request, res: Response) => {
  const { body } = req;
  console.log('## Received body:', body.meow);
  res.json({ message: 'Request received successfully', data: body });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('## port, apiKey: ', port, apiKey);
});
