import { Request, Response } from 'express';
import { deleteContentLogic } from './delete-content-logic';

// cases (can do on FE):
// 1. delete content from content
// 2. delete content that has snippets - will they be reviewable?
// 3. delete content that has reviewed sentences - transfer to seperate sentences?
// 4. delete content that has words

const deleteContent = async (req: Request, res: Response) => {
  const { title, language } = req.body;
  try {
    await deleteContentLogic({ title, language });
    res.status(200).json({ message: `${title} successfully deleted` });
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Error deleting content' });
  }
};

export { deleteContent };
