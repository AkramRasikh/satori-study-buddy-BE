import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to handle requests
app.post('/api/endpoint', (req: Request, res: Response) => {
  const { body } = req;
  console.log('## Received body:', body.meow);
  res.json({ message: 'Request received successfully', data: body });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
