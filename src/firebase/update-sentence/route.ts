import { Request, Response } from 'express';
import { updateSentenceLogic } from './update-sentence-logic';
import { validationResult } from 'express-validator';

const updateSentence = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id, title, fieldToUpdate, language } = req.body;
  const sentence = fieldToUpdate.targetLang;
  const voice = req.body?.voice;

  const withAudio = req.body?.withAudio;
  try {
    const data = await updateSentenceLogic({
      id,
      title,
      fieldToUpdate,
      sentence,
      voice,
      language,
      withAudio,
    });
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error?.message || 'Error updating sentence' });
  }
};

export { updateSentence };
