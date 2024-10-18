import { Request, Response } from 'express';
import { deleteSnippetLogic } from './delete-snippet-logic';

const deleteSnippet = async (req: Request, res: Response) => {
  const id = req.body.id;
  const language = req.body.language;
  try {
    const data = await deleteSnippetLogic({ language, id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export { deleteSnippet };
