import { Request, Response } from 'express';
import { deleteWordLogic } from './delete-word-logic';
import { validationResult } from 'express-validator';

const deleteWord = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.body.id;
  const language = req.body.language;

  try {
    const deletedWord = await deleteWordLogic({ language, id });
    res.status(200).json({ message: `${deletedWord} word deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.message || `Error deleting ${language} word` });
  }
};

export { deleteWord };
