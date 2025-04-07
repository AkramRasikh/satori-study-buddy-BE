/**
 * Generates a culturally-adapted translation prompt for DeepSeek API
 * @param {Object} params - Translation parameters
 * @param {string} params.sentence - Source sentence to translate
 * @param {string} params.targetLanguage - Target language code (e.g. 'fr')
 * @param {string} [params.context] - Additional context for accurate translation
 * @param {boolean} [params.includeVariations=false] - When true, returns 2-3 translation variants
 * @returns {string} Formatted API prompt
 */
export const howToSayPrompt = ({
  sentence,
  targetLanguage,
  context,
  includeVariations = false,
}) => `
Translate "${sentence}" into natural ${targetLanguage}${
  context ? ` (context: ${context})` : ''
}.

### Critical Directive:
${
  includeVariations
    ? 'Provide exactly 2-3 culturally-distinct versions'
    : 'Provide ONLY ONE best translation - never multiple versions'
}

### Strict Requirements:
1. ${
  includeVariations
    ? 'Include 2-3 variations MAXIMUM'
    : 'STRICTLY PROHIBITED to provide multiple versions - ONLY ONE translation'
}
2. Always use these exact JSON field names: "sentences", "targetLang", "notes"
3. Never include additional fields like "type" or "confidence"

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "targetLang": "${
        includeVariations ? 'Primary translation' : 'Best translation'
      }",
      "notes": "Cultural/literal rationale"
    }${
      includeVariations
        ? `,
    {
      "targetLang": "Alternative version",
      "notes": "When this variant would be used"
    },
    {
      "targetLang": "Third variant (if culturally distinct)",
      "notes": "Specific context for this version"
    }`
        : ''
    }
  ]
}

### Absolute Prohibitions:
- ${includeVariations ? '' : 'NEVER provide multiple translations - ONLY ONE'}
- No additional text outside JSON
- No markdown formatting
- No field name variations (e.g., use "targetLang" exactly)
`;

/**
 * Generates a prompt for cultural expression inquiries with strict variation control
 * @param {Object} params - Inquiry parameters
 * @param {string} params.inquiry - The "how do you..." question (e.g. "express doubt")
 * @param {string} params.targetLanguage - Target language code (e.g. 'ja')
 * @param {string} [params.context] - Situational context
 * @param {boolean} [params.includeVariations=false] - Whether to include multiple expressions
 * @returns {string} Formatted API prompt
 */
export const howToExpressPrompt = ({
  inquiry,
  targetLanguage,
  context,
  includeVariations = false,
}) => `
Explain how to "${inquiry}" in natural ${targetLanguage}${
  context ? ` (context: ${context})` : ''
}.

### Critical Directive:
${
  includeVariations
    ? 'Provide exactly 2-3 distinct cultural expressions'
    : 'Provide ONLY THE SINGLE MOST COMMON expression - never multiple versions'
}

### Strict Requirements:
1. ${
  includeVariations
    ? 'Include 2-3 variations MAXIMUM'
    : 'STRICTLY PROHIBITED to provide multiple expressions - ONLY ONE'
}
2. For ${includeVariations ? 'each' : 'the'} expression include:
   - baseLang: The English equivalent
   - targetLang: The ${targetLanguage} expression
   - notes: When/how to use it

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "baseLang": "English phrase",
      "targetLang": "${targetLanguage} translation",
      "notes": "Usage context"
    }${
      includeVariations
        ? `,
    {
      "baseLang": "Alternative English",
      "targetLang": "${targetLanguage} variant",
      "notes": "Specific use-case"
    }`
        : ''
    }
  ]
}

### Absolute Prohibitions:
- ${includeVariations ? '' : 'NEVER provide multiple expressions - ONLY ONE'}
- No additional commentary
- No markdown formatting
- No deviation from specified field names
`;

/**
 * Generates a prompt to contrast grammatical constructions with nuanced differences
 * @param {Object} params - Parameters for grammar analysis
 * @param {string} params.baseSentence - Original sentence to analyze
 * @param {string} [params.grammarSection] - Highlighted section of the sentence (e.g., "were ever" in "If I were ever rich")
 * @param {string} [params.context] - Explanation of confusion (e.g., "Why use 'were ever' instead of 'were'?")
 * @param {string} params.targetLanguage - Target language for translations (e.g., 'es')
 * @param {boolean} [params.includeVariations=false] - If true, shows 2-3 contrastive constructions
 * @returns {string} Formatted API prompt
 */
export const grammarContrastPrompt = ({
  baseSentence,
  grammarSection,
  context,
  targetLanguage,
  includeVariations = false,
}) => `
Analyze the grammatical nuance in "${baseSentence}"${
  grammarSection ? ` (focus: "${grammarSection}")` : ''
}${context ? `\nContext: ${context}` : ''}.

### Key Task:
Compare ${
  includeVariations
    ? '2-3 near-synonymous or antagonistic constructions'
    : 'the original against ONE alternative construction'
} in ${targetLanguage} to highlight:
1. Subtle differences in meaning, tone, or usage
2. Why a native speaker might choose one over the other

### Strict Requirements:
1. ${
  includeVariations
    ? 'Provide 2-3 variants MAXIMUM'
    : 'Provide ONLY ONE contrastive example'
}
2. Use these exact JSON fields: 
   - "sentences" (array)
   - "targetLang" (translation)
   - "baseLang" (original phrase if applicable)
   - "notes" (nuance explanation)
   - "isGrammar" (ALWAYS true)

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      ${grammarSection ? `"baseLang": "${grammarSection}",` : ''}
      "targetLang": "Original construction",
      "notes": "Default meaning/usage",
      "isGrammar": true
    }${
      includeVariations
        ? `,
    {
      "baseLang": ${grammarSection ? `"${grammarSection}"` : 'null'},
      "targetLang": "Variant 1",
      "notes": "Key difference: e.g., stronger doubt, formality, etc.",
      "isGrammar": true
    },
    {
      "baseLang": ${grammarSection ? `"${grammarSection}"` : 'null'},
      "targetLang": "Variant 2 (if applicable)",
      "notes": "Specific context where this is preferred",
      "isGrammar": true
    }`
        : `,
    {
      "baseLang": ${grammarSection ? `"${grammarSection}"` : 'null'},
      "targetLang": "Contrastive example",
      "notes": "Why this alternative changes meaning/tone",
      "isGrammar": true
    }`
    }
  ]
}

### Prohibitions:
- Never omit "isGrammar": true
- No additional commentary outside JSON
- No markdown formatting
- No deviation from specified field names
`;
