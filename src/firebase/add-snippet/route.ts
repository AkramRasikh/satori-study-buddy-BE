import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { addSnippetLogic } from './add-snippet-logic';
import { snippets } from '../refs';

const addSnippet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const language = req.body.language;
  const contentEntry = req.body.contentEntry; // .snippet

  try {
    const data = await addSnippetLogic({
      ref: snippets,
      language,
      contentEntry,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export { addSnippet };
