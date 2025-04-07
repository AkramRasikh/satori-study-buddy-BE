import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { deepSeekChatAPI } from '../chat-gpt';

import { addSentencesBulkToDb } from '../../firebase/add-word-context/route';
import { getInitSentenceCard } from '../../../create-card';
import googleTextToSpeechAPI from '../google-text-to-speech';
import {
  grammarContrastPrompt,
  howToExpressPrompt,
  howToSayPrompt,
} from './prompt';

const adhocSentenceTTS = async (req: Request, res: Response) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;

  const language = req.body.language;
  const sentence = req.body.sentence;
  const context = req.body?.context;
  const includeVariations = req.body?.includeVariations;
  const sentencePrompt = howToSayPrompt({
    sentence,
    targetLanguage: language,
    context,
    includeVariations,
  });

  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'deepseek-chat',
      openAIKey: deepseekKey,
    });

    const sentencesFromResult = resultContent.sentences;

    const sentencesWithIds = sentencesFromResult.map((sentenceData) => ({
      id: uuidv4(),
      topic: 'sentence-helper',
      hasAudio: true,
      baseLang: sentence,
      context,
      reviewData: getInitSentenceCard(),
      ...sentenceData,
    }));
    const sentencesToAddFromDB = await addSentencesBulkToDb({
      language,
      sentencesBulk: sentencesWithIds,
    });

    await Promise.all(
      sentencesWithIds.map(async (item) => {
        const id = item.id;
        const text = item.targetLang;

        return await googleTextToSpeechAPI({
          id,
          text,
          language,
        });
      }),
    );

    res.status(200).json(sentencesToAddFromDB);
  } catch (error) {
    console.log('## /adhoc-sentence-tts error', error);
    res.status(500).json({ error });
  }
};
const adhocExpressionTTS = async (req: Request, res: Response) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;

  const language = req.body.language;
  const inquiry = req.body.inquiry;
  const context = req.body?.context;
  const includeVariations = req.body?.includeVariations;
  const sentencePrompt = howToExpressPrompt({
    inquiry,
    targetLanguage: language,
    context,
    includeVariations,
  });

  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'deepseek-chat',
      openAIKey: deepseekKey,
    });

    const sentencesFromResult = resultContent.sentences;

    const sentencesWithIds = sentencesFromResult.map((sentenceData) => ({
      id: uuidv4(),
      topic: 'sentence-helper',
      hasAudio: true,
      inquiry,
      context,
      reviewData: getInitSentenceCard(),
      ...sentenceData,
    }));
    const sentencesToAddFromDB = await addSentencesBulkToDb({
      language,
      sentencesBulk: sentencesWithIds,
    });

    await Promise.all(
      sentencesWithIds.map(async (item) => {
        const id = item.id;
        const text = item.targetLang;

        return await googleTextToSpeechAPI({
          id,
          text,
          language,
        });
      }),
    );

    res.status(200).json(sentencesToAddFromDB);
  } catch (error) {
    console.log('## /adhoc-expression-tts error', error);
    res.status(500).json({ error });
  }
};

const grammarContrastTTS = async (req: Request, res: Response) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;

  const language = req.body.language;
  const baseSentence = req.body.baseSentence;
  const context = req.body?.context || '';
  const grammarSection = req.body?.grammarSection;
  const includeVariations = req.body?.includeVariations;
  const isSubtleDiff = req.body?.isSubtleDiff;
  const sentencePrompt = grammarContrastPrompt({
    baseSentence,
    targetLanguage: language,
    context,
    includeVariations,
    grammarSection,
    isSubtleDiff,
  });

  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'deepseek-chat',
      openAIKey: deepseekKey,
    });

    const sentencesFromResult = resultContent.sentences;

    const sentencesWithIds = sentencesFromResult.map((sentenceData) => ({
      id: uuidv4(),
      topic: 'sentence-helper',
      hasAudio: true,
      baseSentence,
      context,
      reviewData: getInitSentenceCard(),
      ...sentenceData,
    }));

    const sentencesToAddFromDB = await addSentencesBulkToDb({
      language,
      sentencesBulk: sentencesWithIds,
    });

    await Promise.all(
      sentencesWithIds.map(async (item) => {
        const id = item.id;
        const text = item.targetLang;

        return await googleTextToSpeechAPI({
          id,
          text,
          language,
        });
      }),
    );
    res.status(200).json(sentencesToAddFromDB);
  } catch (error) {
    console.log('## /grammar-contrast-tts error', error);
    res.status(500).json({ error });
  }
};

export { adhocSentenceTTS, adhocExpressionTTS, grammarContrastTTS };
