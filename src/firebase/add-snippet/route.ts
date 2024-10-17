import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { addSnippetLogic } from './add-snippet-logic';

const addSnippet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const language = req.body.language;
  const snippet = req.body.snippet;

  try {
    const data = await addSnippetLogic({
      language,
      snippet,
    });
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || `Error adding snippet for ${language}` });
  }
};

export { addSnippet };
