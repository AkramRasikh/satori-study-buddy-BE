import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { updateWordLogic } from './update-word-logic';

const updateWord = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { wordId, language, fieldToUpdate } = req.body;

  try {
    const fieldToUpdateRes = await updateWordLogic({
      language,
      id: wordId,
      fieldToUpdate,
    });
    if (fieldToUpdateRes) {
      res.status(200).json(fieldToUpdateRes);
    } else {
      res.status(400).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error updating word' });
  }
};

export { updateWord };
