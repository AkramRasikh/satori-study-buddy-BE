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
