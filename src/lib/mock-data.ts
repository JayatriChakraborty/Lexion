export const APP_NAME = "Lexion";

export type SubmissionType = "Text" | "Image" | "Audio" | "Transcript" | "Translation";
export type AnalysisStatus = "Analysed" | "Analysing" | "Not analysed";

export type Correction = {
  original: string;
  corrected: string;
  category: MistakeCategory;
  severity: "error" | "suggestion" | "info";
  explanation: string;
};

export type Submission = {
  id: string;
  title: string;
  language: string;
  type: SubmissionType;
  date: string;
  preview: string;
  status: AnalysisStatus;
  context?: string;
  original: string;
  interpretation?: string;
  analysis?: {
    corrections: Correction[];
    strengths: string[];
    naturalness: string;
    register: string;
    vocabulary: string[];
    translation: string;
    observations: string[];
  };
};

export type MistakeCategory =
  | "Grammar"
  | "Spelling"
  | "Vocabulary"
  | "Syntax"
  | "Pronunciation"
  | "Naturalness"
  | "Register"
  | "Other";

export const languages = [
  "French",
  "English",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Japanese",
];

export const submissions: Submission[] = [
  {
    id: "sub-1",
    title: "Monologue about my university experience",
    language: "French",
    type: "Audio",
    date: "2026-08-25",
    preview:
      "J'ai commencé mes études à Lyon en septembre, et au début c'était vraiment difficile de m'habituer…",
    status: "Analysed",
    context: "A 5-minute monologue about my university experience.",
    original:
      "J'ai commencé mes études à Lyon en septembre, et au début c'était vraiment difficile de m'habituer. Je pensais à ma famille tous les jours. Après deux mois, j'ai rencontré des amis dans mon cours de linguistique et maintenant je suis très content de être ici. Je vais à la bibliothèque chaque matin pour étudier avant les cours.",
    interpretation:
      "You are describing your first months at university in Lyon: the initial difficulty of adjusting, missing your family, making friends in your linguistics course, and your current morning study routine.",
    analysis: {
      corrections: [
        {
          original: "je suis très content de être ici",
          corrected: "je suis très content d'être ici",
          category: "Spelling",
          severity: "error",
          explanation:
            "'de' elides to 'd'' before a vowel sound. This is automatic in French, so 'de être' is never written.",
        },
        {
          original: "Je pensais à ma famille tous les jours.",
          corrected: "Ma famille me manquait tous les jours.",
          category: "Naturalness",
          severity: "suggestion",
          explanation:
            "Your sentence is correct, but a French speaker would more naturally use 'manquer' to express missing someone.",
        },
        {
          original: "dans mon cours de linguistique",
          corrected: "en cours de linguistique",
          category: "Grammar",
          severity: "suggestion",
          explanation:
            "With 'cours', French prefers 'en cours de' when talking about being in class rather than 'dans mon cours de'.",
        },
      ],
      strengths: [
        "Consistent and correct use of the passé composé across the whole monologue.",
        "Clear chronological structure: arrival, difficulty, turning point, present routine.",
        "Good rhythm and few hesitations for a five-minute spoken piece.",
      ],
      naturalness:
        "Overall this sounds like a real, fluent speaker telling a personal story. Two phrases are slightly textbook-like, but nothing sounds foreign.",
      register:
        "Neutral spoken register, appropriate for talking to a tutor or classmate. Slightly more formal than casual conversation, which suits the task.",
      vocabulary: ["s'habituer à", "manquer à quelqu'un", "en cours de", "dès le début", "au fil des semaines"],
      translation:
        "I started my studies in Lyon in September and at first it was really hard to adjust. I thought about my family every day. After two months I met friends in my linguistics course and now I'm very happy to be here. I go to the library every morning to study before class.",
      observations: [
        "Elision before vowels is the single recurring mechanical issue in this piece.",
        "Your spoken pace slows before prepositions, which often precedes an error.",
      ],
    },
  },
  {
    id: "sub-2",
    title: "Email to my landlord about the heating",
    language: "French",
    type: "Text",
    date: "2026-08-23",
    preview: "Bonjour Madame, Je vous écris concernant le chauffage dans mon appartement qui ne marche pas…",
    status: "Analysed",
    context: "A formal email asking my landlord to repair the heating.",
    original:
      "Bonjour Madame,\n\nJe vous écris concernant le chauffage dans mon appartement qui ne marche pas depuis samedi. Est-ce que vous pouvez envoyer quelqu'un pour le réparer ? Je suis disponible tous les après-midis cette semaine.\n\nMerci beaucoup,\nAlex",
    interpretation:
      "A formal request to your landlord to send a technician to repair the heating, with your availability.",
    analysis: {
      corrections: [
        {
          original: "Est-ce que vous pouvez envoyer quelqu'un",
          corrected: "Pourriez-vous envoyer quelqu'un",
          category: "Register",
          severity: "suggestion",
          explanation:
            "In a formal written request, the conditional 'pourriez-vous' is warmer and more appropriate than 'est-ce que vous pouvez'.",
        },
        {
          original: "Merci beaucoup,",
          corrected: "Je vous remercie par avance, cordialement,",
          category: "Register",
          severity: "info",
          explanation:
            "French formal emails close with a fuller formula. 'Merci beaucoup' alone reads as informal.",
        },
      ],
      strengths: [
        "Clear opening that states the problem and the date it started.",
        "You offered your availability, which is exactly what makes such an email effective.",
      ],
      naturalness: "The content is natural and easy to read; only the politeness formulas feel slightly casual.",
      register: "You aimed for formal and landed on neutral-polite. Small formula changes lift it fully.",
      vocabulary: ["une panne de chauffage", "faire intervenir un technicien", "dans les meilleurs délais"],
      translation:
        "Hello Madam, I'm writing about the heating in my flat, which hasn't worked since Saturday. Could you send someone to repair it? I'm available every afternoon this week. Thank you very much, Alex",
      observations: ["Register formulas are your most frequent non-grammatical gap in written French."],
    },
  },
  {
    id: "sub-3",
    title: "Handwritten class notes on the subjunctive",
    language: "French",
    type: "Image",
    date: "2026-08-21",
    preview: "Photograph of a notebook page listing subjunctive triggers and example sentences.",
    status: "Not analysed",
    original: "Photograph of a notebook page listing subjunctive triggers and example sentences.",
  },
  {
    id: "sub-4",
    title: "Transcript: coffee shop conversation",
    language: "Spanish",
    type: "Transcript",
    date: "2026-08-19",
    preview: "— ¿Qué te pongo? — Un cortado, por favor. Y… ¿tienen algo sin gluten para comer?",
    status: "Analysed",
    context: "Ordering in a café in Madrid.",
    original:
      "— ¿Qué te pongo?\n— Un cortado, por favor. Y… ¿tienen algo sin gluten para comer?\n— Sí, tenemos tortilla.\n— Perfecto, quiero eso también. ¿Cuánto es todo?",
    interpretation: "A short café exchange: ordering a cortado, asking for gluten-free food, and asking the price.",
    analysis: {
      corrections: [
        {
          original: "quiero eso también",
          corrected: "me pongo eso también / póngame eso también",
          category: "Naturalness",
          severity: "suggestion",
          explanation:
            "'Quiero' is understood but blunt when ordering. Spanish speakers soften with 'me pones' or 'póngame'.",
        },
      ],
      strengths: [
        "You handled a real unscripted exchange without switching to English.",
        "Your question about gluten-free options was clear and correctly formed.",
      ],
      naturalness: "Very close to how a local would order; one softening phrase away from fully idiomatic.",
      register: "Casual and friendly, correct for a café.",
      vocabulary: ["un cortado", "sin gluten", "¿me cobras?", "para llevar"],
      translation:
        "— What can I get you? — A cortado, please. And… do you have anything gluten-free to eat? — Yes, we have tortilla. — Perfect, I'd like that too. How much is it all?",
      observations: ["In Spanish you default to direct forms; softening is your main naturalness gap."],
    },
  },
  {
    id: "sub-5",
    title: "Translation practice: news paragraph",
    language: "German",
    type: "Translation",
    date: "2026-08-16",
    preview: "Die Regierung hat angekündigt, dass die neuen Regeln ab Januar gelten werden…",
    status: "Analysed",
    context: "Translating an English news paragraph into German.",
    original:
      "Die Regierung hat angekündigt, dass die neuen Regeln ab Januar gelten werden. Viele Unternehmen sind besorgt, weil sie nicht genug Zeit haben, sich vorzubereiten.",
    interpretation:
      "A translation of a news item about new rules taking effect in January and businesses' concerns about preparation time.",
    analysis: {
      corrections: [
        {
          original: "die neuen Regeln ab Januar gelten werden",
          corrected: "die neuen Regeln ab Januar gelten",
          category: "Grammar",
          severity: "suggestion",
          explanation:
            "German often uses the present tense for scheduled future events; the future auxiliary is unnecessary here.",
        },
      ],
      strengths: [
        "Correct verb-final word order in both subordinate clauses.",
        "Accurate rendering of the source meaning without over-literal translation.",
      ],
      naturalness: "Reads like real German news prose.",
      register: "Formal written / journalistic — exactly right for the source text.",
      vocabulary: ["in Kraft treten", "sich vorbereiten auf", "besorgt sein über"],
      translation:
        "The government has announced that the new rules will apply from January. Many companies are concerned because they don't have enough time to prepare.",
      observations: ["You transfer English tense structures into German; watch scheduled-future contexts."],
    },
  },
  {
    id: "sub-6",
    title: "Short essay: why I read in French",
    language: "French",
    type: "Text",
    date: "2026-08-12",
    preview: "Depuis que j'ai commencé à lire des romans en français, j'ai remarqué que mon vocabulaire…",
    status: "Analysed",
    context: "A 300-word essay for my tutor.",
    original:
      "Depuis que j'ai commencé à lire des romans en français, j'ai remarqué que mon vocabulaire est devenu plus riche. Je lis avant de dormir, environ trente minutes. Parfois je ne comprends pas tous les mots mais je continue quand même, parce que je pense que c'est important de rester dans l'histoire.",
    interpretation:
      "An essay explaining how reading French novels before bed has widened your vocabulary and why you keep reading despite unknown words.",
    analysis: {
      corrections: [
        {
          original: "c'est important de rester dans l'histoire",
          corrected: "il est important de rester dans l'histoire",
          category: "Register",
          severity: "info",
          explanation:
            "'C'est' is fine in speech; in written essays 'il est' is the expected impersonal form.",
        },
      ],
      strengths: [
        "Strong connectors ('depuis que', 'parce que', 'quand même') used accurately.",
        "A clear personal argument sustained across the paragraph.",
      ],
      naturalness: "Warm and natural essay voice.",
      register: "Semi-formal written, appropriate for a tutor.",
      vocabulary: ["s'enrichir", "au fil de la lecture", "faire l'impasse sur", "se laisser porter"],
      translation:
        "Since I started reading novels in French, I've noticed my vocabulary has become richer. I read before sleeping, about thirty minutes. Sometimes I don't understand every word but I keep going anyway, because I think it's important to stay inside the story.",
      observations: ["Written/spoken register mixing appears again here."],
    },
  },
];

export type StudyNote = {
  id: string;
  title: string;
  language: string;
  generatedFrom: string;
  updated: string;
  rule: string;
  whyYou: string;
  correct: string[];
  incorrect: { wrong: string; right: string }[];
  alternatives: string[];
  vocabulary: string[];
  summary: string;
};

export const studyNotes: StudyNote[] = [
  {
    id: "note-1",
    title: "Your French: Prepositions with places and courses",
    language: "French",
    generatedFrom: "7 submissions · 11 related observations",
    updated: "2026-08-25",
    rule: "French chooses a preposition based on the noun that follows it. With study contexts, 'en cours de' describes being in class, 'à la bibliothèque' describes location, and 'dans' is reserved for physically inside something.",
    whyYou:
      "In English, 'in' covers all three cases. Your errors cluster exactly where English uses one word and French uses three — which is a mapping problem, not a knowledge gap.",
    correct: [
      "Je suis en cours de linguistique.",
      "Je travaille à la bibliothèque le matin.",
      "Il y a une erreur dans mon texte.",
    ],
    incorrect: [
      { wrong: "Je suis dans mon cours de linguistique.", right: "Je suis en cours de linguistique." },
      { wrong: "J'étudie dans la bibliothèque.", right: "J'étudie à la bibliothèque." },
    ],
    alternatives: ["J'ai cours de linguistique à 10h.", "Je révise à la BU.", "Je suis en amphi."],
    vocabulary: ["assister à un cours", "la BU (bibliothèque universitaire)", "un amphi", "réviser"],
    summary:
      "When the place is an activity, use 'en'. When it's a destination or habitual location, use 'à'. Keep 'dans' for literal interiors.",
  },
  {
    id: "note-2",
    title: "Your French: Formal email closings",
    language: "French",
    generatedFrom: "3 submissions · 5 related observations",
    updated: "2026-08-23",
    rule: "French formal correspondence expects a fixed politeness formula before the signature, not a bare thank-you.",
    whyYou:
      "Your grammar in formal writing is already accurate — the gap is conventional phrasing, which no rule book forces you to learn but every reader notices.",
    correct: [
      "Je vous remercie par avance de votre retour.",
      "Cordialement,",
      "Dans l'attente de votre réponse, je vous prie d'agréer mes salutations distinguées.",
    ],
    incorrect: [{ wrong: "Merci beaucoup, Alex", right: "Je vous remercie par avance. Cordialement, Alex" }],
    alternatives: ["Bien à vous,", "Bien cordialement,", "Avec mes remerciements,"],
    vocabulary: ["dans l'attente de", "par avance", "à votre convenance", "dans les meilleurs délais"],
    summary: "Pick one closing formula and reuse it. 'Je vous remercie par avance. Cordialement,' fits almost every situation.",
  },
  {
    id: "note-3",
    title: "Your Spanish: Softening requests",
    language: "Spanish",
    generatedFrom: "2 submissions · 3 related observations",
    updated: "2026-08-19",
    rule: "Spanish service interactions soften requests with second-person present ('¿me pones…?') or the imperative ('póngame…') rather than stating desire with 'quiero'.",
    whyYou:
      "You translate 'I'd like' literally. The Spanish equivalent moves politeness into the verb form instead of the wording.",
    correct: ["¿Me pones un café, por favor?", "Póngame una tortilla, por favor.", "¿Me cobras, por favor?"],
    incorrect: [{ wrong: "Quiero eso también.", right: "Me pones eso también, por favor." }],
    alternatives: ["¿Me sacas un cortado?", "Para llevar, por favor."],
    vocabulary: ["cobrar", "para llevar", "un cortado", "sin gluten"],
    summary: "Swap 'quiero' for '¿me pones…?' and your café Spanish immediately sounds local.",
  },
];

export type Mistake = {
  id: string;
  label: string;
  category: MistakeCategory;
  language: string;
  occurrences: number;
  lastOccurrence: string;
  mastery: number;
  example: string;
};

export const mistakes: Mistake[] = [
  {
    id: "m1",
    label: "Preposition choice with places and courses",
    category: "Grammar",
    language: "French",
    occurrences: 11,
    lastOccurrence: "2026-08-25",
    mastery: 42,
    example: "dans mon cours → en cours de",
  },
  {
    id: "m2",
    label: "Missing elision before a vowel (de être)",
    category: "Spelling",
    language: "French",
    occurrences: 8,
    lastOccurrence: "2026-08-25",
    mastery: 61,
    example: "de être → d'être",
  },
  {
    id: "m3",
    label: "Spoken register in written essays ('c'est' vs 'il est')",
    category: "Register",
    language: "French",
    occurrences: 6,
    lastOccurrence: "2026-08-12",
    mastery: 55,
    example: "c'est important → il est important",
  },
  {
    id: "m4",
    label: "Literal translation of 'to miss someone'",
    category: "Naturalness",
    language: "French",
    occurrences: 5,
    lastOccurrence: "2026-08-25",
    mastery: 48,
    example: "je pense à ma famille → ma famille me manque",
  },
  {
    id: "m5",
    label: "Direct requests without softening",
    category: "Naturalness",
    language: "Spanish",
    occurrences: 4,
    lastOccurrence: "2026-08-19",
    mastery: 37,
    example: "quiero eso → ¿me pones eso?",
  },
  {
    id: "m6",
    label: "English future tense carried into German",
    category: "Syntax",
    language: "German",
    occurrences: 3,
    lastOccurrence: "2026-08-16",
    mastery: 66,
    example: "gelten werden → gelten",
  },
  {
    id: "m7",
    label: "Nasal vowel /ɑ̃/ pronounced as /ɔ̃/",
    category: "Pronunciation",
    language: "French",
    occurrences: 7,
    lastOccurrence: "2026-08-25",
    mastery: 34,
    example: "'temps' produced closer to 'ton'",
  },
  {
    id: "m8",
    label: "Reaching for a general word instead of a precise one",
    category: "Vocabulary",
    language: "French",
    occurrences: 9,
    lastOccurrence: "2026-08-21",
    mastery: 52,
    example: "faire → réaliser / effectuer / mener",
  },
];

export type LanguageProfile = {
  id: string;
  name: string;
  flagless: string;
  level: string;
  target: string;
  variant?: string;
  variantOptions?: string[];
  active: boolean;
  submissions: number;
};

export const languageProfiles: LanguageProfile[] = [
  {
    id: "fr",
    name: "French",
    flagless: "FR",
    level: "B2",
    target: "C1",
    variant: "France",
    variantOptions: ["France", "Canada", "Belgium", "Switzerland", "International / unspecified"],
    active: true,
    submissions: 34,
  },
  {
    id: "es",
    name: "Spanish",
    flagless: "ES",
    level: "A2",
    target: "B1",
    variant: "Spain",
    variantOptions: ["Spain", "Mexico", "Argentina", "International / unspecified"],
    active: false,
    submissions: 9,
  },
  {
    id: "de",
    name: "German",
    flagless: "DE",
    level: "B1",
    target: "B2",
    variant: "International / unspecified",
    variantOptions: ["Germany", "Austria", "Switzerland", "International / unspecified"],
    active: false,
    submissions: 6,
  },
];

export const progressSeries = {
  "7": [
    { label: "Mon", grammar: 82, spelling: 88, vocabulary: 61, naturalness: 70, complexity: 58 },
    { label: "Tue", grammar: 83, spelling: 87, vocabulary: 62, naturalness: 71, complexity: 59 },
    { label: "Wed", grammar: 85, spelling: 89, vocabulary: 63, naturalness: 72, complexity: 60 },
    { label: "Thu", grammar: 84, spelling: 90, vocabulary: 64, naturalness: 72, complexity: 62 },
    { label: "Fri", grammar: 86, spelling: 90, vocabulary: 66, naturalness: 74, complexity: 63 },
    { label: "Sat", grammar: 88, spelling: 91, vocabulary: 67, naturalness: 75, complexity: 64 },
    { label: "Sun", grammar: 89, spelling: 92, vocabulary: 68, naturalness: 76, complexity: 65 },
  ],
  "30": [
    { label: "Week 1", grammar: 76, spelling: 82, vocabulary: 52, naturalness: 61, complexity: 48 },
    { label: "Week 2", grammar: 79, spelling: 85, vocabulary: 57, naturalness: 65, complexity: 53 },
    { label: "Week 3", grammar: 83, spelling: 88, vocabulary: 62, naturalness: 70, complexity: 58 },
    { label: "Week 4", grammar: 89, spelling: 92, vocabulary: 68, naturalness: 76, complexity: 65 },
  ],
  "90": [
    { label: "Jun", grammar: 68, spelling: 74, vocabulary: 41, naturalness: 50, complexity: 38 },
    { label: "Jul", grammar: 77, spelling: 84, vocabulary: 55, naturalness: 63, complexity: 51 },
    { label: "Aug", grammar: 89, spelling: 92, vocabulary: 68, naturalness: 76, complexity: 65 },
  ],
};

export const mistakeReduction = [
  { label: "Jun", recurring: 24 },
  { label: "Jul", recurring: 18 },
  { label: "Aug", recurring: 11 },
];

export const pronunciationScores = [
  { label: "Nasal vowels", value: 54 },
  { label: "Liaison", value: 71 },
  { label: "Rhythm", value: 78 },
  { label: "Final consonants", value: 83 },
];

export const noticed = {
  title: "You hesitate right before prepositions",
  body: "Across your last six French submissions, 9 of 14 corrections happened within three words of a preposition — and in your audio, your pace slows just before them. This isn't carelessness: you're translating from English in real time at exactly that point.",
  suggestion: "A short study note on prepositions with places and courses is already waiting for you.",
};
