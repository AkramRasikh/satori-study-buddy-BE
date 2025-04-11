const combineWordsPrompt = ({
  words,
  targetLanguage,
  bonusWords = [],
  myCombinedSentence,
}) => `
Generate simple, creative, and coherent sentences using the following words. The sentences do not need to be related to each other, but it's great if they are. Provide the response as a JSON object with a \`sentences\` array. Each sentence should contain:
  1. \`baseLang\`: The English sentence.
  2. \`targetLang\`: The translated sentence in ${targetLanguage}.
  3. \`matchedWordsSurface\`: An array of the words (in their original script ${targetLanguage}) that appear in the sentence, even if their form is slightly altered (e.g., conjugated, pluralized, etc.).
  4. \`matchedWordsId\`: An array of the corresponding word IDs that were used in the sentence, regardless of how the words are modified in the sentence.
  4. \`notes\`: Explain any nuances that may be relevant to me as a learner

### Core Instructions:
- **Core Words First**: Prioritize sentences using at least 2 words from the **Core Words** list below. Core words to sentences ratio should ideally be one to one but never more than one to two.
- **Bonus Words (Optional)**: Use words from the **Bonus Words** list only if they fit naturally. Do not force them.  
- **Simplicity**: Default to straightforward sentences unless words require creative combinations.  
- **Grammar Variety**: Include questions, imperatives, or conditionals where possible.  
- **Word Forms**: Include modified words (e.g., "running" for "run") in \`matchedWordsSurface\` and \`matchedWordsId\`.  
- **Override Bad Definitions**: If a word’s definition seems unnatural, use it in a more logical way.  

${
  myCombinedSentence
    ? `
### Strict Instructions:
1. **If \`myCombinedSentence\` is provided and uses at least some of the given words:**
   - Return **ONLY** that sentence (translated into ${targetLanguage}) in the \`sentences\` array.
   - **Do NOT generate any additional sentences.**
2. **If \`myCombinedSentence\` is missing or invalid (uses none of the words):**
   - Proceed with normal generation (core words first, bonus words if natural).
3. Natural is always more important than just strict adherence.
4. Strict instruction: For words that don't fit in this - and only those - create a sentence/sentences given the above core instructions

### User-Provided Sentence (Override if Valid):
- **"${myCombinedSentence}"** will replace AI-generated sentences if it matches the words.`
    : ''
}

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
