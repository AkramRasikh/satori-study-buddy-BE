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

const combineWordsPrompt = ({ words, targetLanguage, bonusWords = [] }) => `
Generate simple, creative, and coherent sentences using the following words. The sentences do not need to be related to each other, but it's great if they are. Provide the response as a JSON object with a \`sentences\` array. Each sentence should contain:
  1. \`baseLang\`: The English sentence.
  2. \`targetLang\`: The translated sentence in ${targetLanguage}.
  3. \`matchedWordsSurface\`: An array of the words (in their original script ${targetLanguage}) that appear in the sentence, even if their form is slightly altered (e.g., conjugated, pluralized, etc.).
  4. \`matchedWordsId\`: An array of the corresponding word IDs that were used in the sentence, regardless of how the words are modified in the sentence.

### Instructions:
- **Core Words First**: Prioritize sentences using at least 2 words from the **Core Words** list below. Ensure each core word appears in ideally 1 sentences but 2 if necessary.
- **Bonus Words (Optional)**: Use words from the **Bonus Words** list only if they fit naturally. Do not force them.  
- **Simplicity**: Default to straightforward sentences unless words require creative combinations.  
- **Grammar Variety**: Include questions, imperatives, or conditionals where possible.  
- **Word Forms**: Include modified words (e.g., "running" for "run") in \`matchedWordsSurface\` and \`matchedWordsId\`.  
- **Override Bad Definitions**: If a word’s definition seems unnatural, use it in a more logical way.  

### Core Words (Priority):
${words
  .map(
    (w) =>
      `- { "id": ${w.id}, "word": "${w.word}", "definition": "${w.definition}" }`,
  )
  .join('\n')}

${
  bonusWords.length > 0
    ? `
### Bonus Words (Use Sparingly, If Natural):
${bonusWords
  .map(
    (w) =>
      `- { "id": ${w.id}, "word": "${w.word}", "definition": "${w.definition}" }`,
  )
  .join('\n')}
`
    : ''
}

Return only valid JSON. Do not include explanatory text.
`;

export { combineWordsPrompt };
