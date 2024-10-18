import { Request, Response } from 'express';
import { addContentLogic } from './add-content-logic';
import { validationResult } from 'express-validator';

const addContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const language = req.body.language;
  const content = req.body.content;

  try {
    const addedContentTitle = await addContentLogic({ language, content });
    res.status(200).json({ message: `Successfully add ${addedContentTitle}` });
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Error adding content' });
  }
};

export { addContent };
