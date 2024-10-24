import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { updateSentenceInContent } from '../update-sentence/update-sentence-logic';

const updateSentenceReview = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id, language, title, fieldToUpdate } = req.body;

  try {
    const { updatedFields } = await updateSentenceInContent({
      id,
      language,
      title,
      fieldToUpdate,
    });
    res.status(200).json(updatedFields);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.message || 'Failed to update sentence review' });
  }
};

export { updateSentenceReview };
