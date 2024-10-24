import { Request, Response } from 'express';
import { addWordLogic } from './add-word-logic';
import { validationResult } from 'express-validator';

const addWord = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { word, language, context, contextSentence, isGoogle } = req.body;

  try {
    const addedWordData = await addWordLogic({
      word,
      language,
      context,
      contextSentence,
      isGoogle,
    });
    res.status(200).json({
      message: `Successfully added word ${addedWordData.baseForm} added`,
      word: addedWordData,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error?.message || `Error adding ${word} in ${language}` });
  }
};

export { addWord };
