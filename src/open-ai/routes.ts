import { Request, Response } from 'express';
import chatGptTextAPI from './chat-gpt';
import { combineWords } from './combine-words/route';
import { combineWordsValidation } from './combine-words/validation';
import { baseRoute } from '../shared-express-utils/base-route';
import {
  breakdownAllSentence,
  breakdownSentence,
} from './sentence-breakdown/route';
import {
  breakdownAllSentenceValidation,
  breakdownSentenceValidation,
} from './sentence-breakdown/validation';
import {
  adhocExpressionTTS,
  adhocSentenceCustomWord,
  adhocSentenceMinimalPairingWords,
  adhocSentenceTTS,
  grammarContrastTTS,
} from './adhoc-sentences/route';
import {
  adhocCustomWordTTSValidation,
  adhocExpressionTTSValidation,
  adhocGrammarTTSValidation,
  adhocMinimalPairingWordTTSValidation,
  adhocSentenceTTSValidation,
} from './adhoc-sentences/validation';

const openAIRoutes = (app) => {
  app.post('/chat-gpt-text', async (req: Request, res: Response) => {
    const { body } = req;
    const openAIKey = body?.openAIKey;
    const sentence = body?.sentence;
    const model = body?.model;
    try {
      const resultContent = await chatGptTextAPI({
        sentence,
        model,
        openAIKey,
      });
      console.log('## /chat-gpt-text success');
      res.status(200).json(resultContent);
    } catch (error) {
      console.log('## yooooo Errror');
      res.status(500).json({ error });
    }
  });

  app.post('/combine-words', combineWordsValidation, baseRoute, combineWords);
  app.post(
    '/breakdown-sentence',
    breakdownSentenceValidation,
    baseRoute,
    breakdownSentence,
  ); // need to validate breakdown sentence
  app.post(
    '/breakdown-all-sentences',
    breakdownAllSentenceValidation,
    baseRoute,
    breakdownAllSentence,
  );
  app.post(
    '/adhoc-sentence-tts',
    adhocSentenceTTSValidation,
    baseRoute,
    adhocSentenceTTS,
  );
  app.post(
    '/adhoc-expression-tts',
    adhocExpressionTTSValidation,
    baseRoute,
    adhocExpressionTTS,
  );
  app.post(
    '/adhoc-grammar-tts',
    adhocGrammarTTSValidation,
    baseRoute,
    grammarContrastTTS,
  );
  app.post(
    '/minimal-pair-sound',
    adhocMinimalPairingWordTTSValidation,
    baseRoute,
    adhocSentenceMinimalPairingWords,
  );
  app.post(
    '/custom-word-prompt',
    adhocCustomWordTTSValidation,
    baseRoute,
    adhocSentenceCustomWord,
  );
};

export { openAIRoutes };
