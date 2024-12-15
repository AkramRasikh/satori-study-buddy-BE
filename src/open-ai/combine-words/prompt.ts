import { languageKey } from '../../eligible-languages';

const exampleJapaneseInput = [
  {
    word: '宣言',
    wordDefinition: 'moving, relocation',
    context: '3月には日系アメリカ人の転居を禁じる宣言が出され',
  },
  {
    word: '転居',
    wordDefinition: 'declaration',
    context: '3月には日系アメリカ人の転居を禁じる宣言が出され',
  },
];

const exampleJapaneseResponse = [
  {
    baseLang:
      'I declared my move to a new town, but my cat was the biggest opponent.',
    targetLang: '新しい町への転居を宣言したけど、猫が一番の反対派です。',
    matchedWords: ['宣言', '転居'],
  },
  {
    baseLang:
      'As soon as I announced my relocation, my friends came over to help clean the house.',
    targetLang: '転居の宣言をした瞬間、友達が家を片付ける手伝いに来た。',
    matchedWords: ['宣言', '転居'],
  },
  {
    baseLang: "The king declared, 'Everyone must relocate!' and chaos ensued.",
    targetLang:
      '王様が『国民全員が転居せよ！』という宣言を出して、みんなパニック。',
    matchedWords: ['宣言', '転居'],
  },
  {
    baseLang:
      'A declaration prohibiting relocation was issued, so all moving plans were canceled.',
    targetLang:
      '転居禁止の宣言が出たので、引っ越し計画は全てキャンセルされた。',
    matchedWords: ['宣言', '転居'],
  },
  {
    baseLang:
      'His declaration about moving surprised everyone, but it was actually just a joke.',
    targetLang: '彼の転居宣言はみんなを驚かせたけど、実はただの冗談だった。',
    matchedWords: ['宣言', '転居'],
  },
];

const additionalMoodPromptNote = (language: string) =>
  language === languageKey.japanese
    ? 'Also mix up the moods i.e. formal, informal, etc'
    : '';

const wordCombinationPrompt = (inputDataJson, language) => `
  I am learning ${language}. The JSON below of “word” and “context”. 
  Combine the words to give me new sentences that is easy to understand. The goal is to make the words understandable and the context provided are only there to help you understand the way in which the words are used.
  If possible, provide more interesting - still simple - and quirky responses.
  If combining all words becomes too much, then they don't all need to be together in the same sentence. Give me multiple if possible
  ${additionalMoodPromptNote(language)}

  As shown in the above example out, return it in JSON format with properties:
  
  1. baseLang - (string) english translation
  2. targetLang - (string) ${language} text
  3. matchedWords - an array of the words used. Note here that the word may be conjugated differently compared to how it is initially provided so use the initially provided word here

  example input ${exampleJapaneseInput}
  example output an array of objects ${exampleJapaneseResponse}

  Real input:
  ${JSON.stringify(inputDataJson)}

  NOTE: this is an integration so only respond in the JSON format as above (array of objects).
`;

export { wordCombinationPrompt };
