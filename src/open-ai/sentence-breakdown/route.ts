import { Request, Response } from 'express';

import { updateSentenceInContent } from '../../firebase/update-sentence/update-sentence-logic';
import { deepSeekChatAPI } from '../chat-gpt';
import { chinese, japanese } from '../../eligible-languages';

const japaneseSentenceStructure =
  '"すでに長刀(薙刀)の稽古に励んでいます": "すでに (already) + 長刀(薙刀)の稽古 (naginata practice) + に励んでいます (is diligently practicing)"';
const chineseSentenceStructure =
  '"我已经开始学习中文了": "我 (I) + 已经 (already) + 开始 (begin) + 学习 (study) + 中文 (Chinese) + 了 (completed action particle)"';

const sentenceStructureObj = {
  [japanese]: japaneseSentenceStructure,
  [chinese]: chineseSentenceStructure,
};

const arabicSentenceBreakdownArr = [
  {
    id: '53fb9dba-84ba-45a5-aa9f-e13d812c23c7',
    meaning: 'So, after the change that happened in Sudan and after',
    sentenceStructure:
      'word (then after) + word (the change) + word (that) + word (happened) + word (in) + word (Sudan) + word (and after)',
    vocab: [
      {
        meaning: 'then after',
        surfaceForm: 'فبعد',
      },
      {
        meaning: 'the change',
        surfaceForm: 'التغيير',
      },
      {
        meaning: 'that',
        surfaceForm: 'الذي',
      },
      {
        meaning: 'happened',
        surfaceForm: 'حدث',
      },
      {
        meaning: 'in',
        surfaceForm: 'في',
      },
      {
        meaning: 'Sudan',
        surfaceForm: 'السودان',
      },
      {
        meaning: 'and after',
        surfaceForm: 'وبعد',
      },
    ],
  },
  {
    id: '45cbc6e0-1797-4855-ba80-63cdba174845',
    meaning: 'In exchange for the material return, then forces...',
    sentenceStructure:
      'مقابل (in exchange for) + بمقابل (in return for) + المادي (the material) + فقوات (then forces)',

    vocab: [
      {
        meaning: 'in exchange for',
        surfaceForm: 'مقابل',
      },
      {
        meaning: 'in return for',
        surfaceForm: 'بمقابل',
      },
      {
        meaning: 'the material',
        surfaceForm: 'المادي',
      },
      {
        meaning: 'then forces',
        surfaceForm: 'فقوات',
      },
    ],
  },
];

export const breakdownSentence = async (req: Request, res: Response) => {
  const { id, language, targetLang, title } = req.body;

  const openAIKey = process.env.DEEPSEEK_KEY;
  const prompt = `Break down the following ${language} sentence strictly into valid JSON output. Do not include explanations, preamble, or any additional text. 
  The JSON format should have the following structure: vocab: An array of objects where each object contains: surfaceForm: The word or phrase as it appears in the sentence. meaning: A brief explanation of its meaning in English. 
  sentenceStructure: A string that represents the sentence structure, maintaining the original word order but adding inline English meanings. For example: Format Example: word (meaning) + word (meaning) + word (meaning) Example Output for a sentence like ${
    sentenceStructureObj[language] || sentenceStructureObj['japanese']
  }. meaning: A string giving a natural translation or explanation of the full sentence in English. Sentence to analyze: ${targetLang}`;

  try {
    const breakdown = await deepSeekChatAPI({
      sentence: prompt,
      model: 'deepseek-chat',
      openAIKey,
    });

    if (breakdown) {
      await updateSentenceInContent({
        id,
        language,
        title,
        fieldToUpdate: breakdown,
      });
      res.status(200).json({ ...breakdown });
    } else {
      res.status(400).json({ error: 'No breakdown?' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};
export const breakdownAllSentence = async (req: Request, res: Response) => {
  const { language, title, sentences } = req.body;

  const openAIKey = process.env.DEEPSEEK_KEY;
  const prompt = `
  Break down the following ${language} sentences strictly into valid JSON output. Do not include explanations, preamble, or any additional text. 
  The JSON format should return an array of objects with the following structure: 

  ### Core Instructions:
  1. id: id of the sentence.
  2. sentenceStructure: A string that represents the sentence structure, maintaining the original word order but adding inline English meanings.
  3. meaning: A string giving a natural translation or explanation of the full sentence in English. 
  4. vocab: An array of objects where each object contains:
    a. surfaceForm: The word or phrase as it appears in the sentence. 
    b. meaning: A brief explanation of its meaning in English. 
  
  ## An example of an ideal response in Arabic: ${JSON.stringify(
    arabicSentenceBreakdownArr,
  )}
  
  ## Sentences to analyze: 
    ${JSON.stringify(sentences)}
  `;

  try {
    const breakdown = await deepSeekChatAPI({
      sentence: prompt,
      model: 'deepseek-chat',
      openAIKey,
    });

    console.log('## breakdown', breakdown);

    if (breakdown) {
      await Promise.all(
        breakdown.map(async (breakdownSentenceWidget) => {
          await updateSentenceInContent({
            id: breakdownSentenceWidget.id,
            language,
            title,
            fieldToUpdate: breakdownSentenceWidget,
          });
        }),
      );
      res.status(200).json(breakdown);
    } else {
      res.status(400).json({ error: 'No breakdown?' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};
