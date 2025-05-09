import { Request, Response } from 'express';
import { deleteSnippetLogic } from './delete-snippet-logic';
import { validationResult } from 'express-validator';

const deleteSnippet = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.body.id;
  const language = req.body.language;
  try {
    const data = await deleteSnippetLogic({ language, id });
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Error deleting snippet' });
  }
};

export { deleteSnippet };
