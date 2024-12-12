import { Request, Response } from 'express';
import underlineTargetWords from './underline-target-words';
import kanjiToHiragana, { tokenizeSentence } from './kanji-to-hiragana';
import { tokeniseContentSentences } from './tokenise-content-sentences/route';
import { tokeniseContentValidation } from './tokenise-content-sentences/validation';

const languageScriptHelpers = (app) => {
  app.post('/kanji-to-hiragana', async (req: Request, res: Response) => {
    const preHiraganaText = req.body?.sentence;
    try {
      const hiraganaTextSentence = await kanjiToHiragana({
        sentence: preHiraganaText,
      });

      res.status(200).json({ sentence: hiraganaTextSentence });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post('/tokenise-sentence', async (req: Request, res: Response) => {
    const preHiraganaText = req.body?.sentence;
    try {
      const hiraganaTextSentence = await tokenizeSentence({
        sentence: preHiraganaText,
      });

      res.status(200).json({ sentence: hiraganaTextSentence });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post(
    '/tokenise-content-segment',
    tokeniseContentValidation,
    tokeniseContentSentences,
  );

  app.post('/underline-target-words', async (req: Request, res: Response) => {
    // need to check body before functions
    const preUnderlinedSentence = req.body.sentence;
    const wordBank = req.body.wordBank;
    try {
      const hiraganaTextSentence = await underlineTargetWords({
        preUnderlinedSentence,
        wordBank,
      });
      console.log('## hiraganaTextSentence: ', hiraganaTextSentence);

      res.status(200).json({ underlinedText: hiraganaTextSentence });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
};

export { languageScriptHelpers };
