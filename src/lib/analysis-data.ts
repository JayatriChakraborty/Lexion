import notebookImage from "@/assets/notebook-sample.jpg";

export type Confidence = "High" | "Medium" | "Context-dependent";

export type IssueCategory =
  | "Grammar"
  | "Spelling"
  | "Vocabulary"
  | "Syntax"
  | "Naturalness"
  | "Register"
  | "Pronunciation";

export type Issue = {
  id: string;
  youWrote: string;
  better: string;
  why: string;
  category: IssueCategory;
  confidence: Confidence;
  severity: "error" | "suggestion" | "info";
  examples: { source: string; gloss: string }[];
};

export type Segment = { text: string; issueId?: string };
export type AnalysedSentence = { id: string; segments: Segment[] };

export type NaturalnessVerdict = "Incorrect" | "Correct but unnatural" | "Natural";
export type NaturalnessItem = {
  verdict: NaturalnessVerdict;
  phrase: string;
  note: string;
  suggestion?: string;
};

export type Metric = { label: string; value: number; note: string };

export type LexiconEntry = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciation: string;
  cefr: string;
  grammar: string;
  examples: { source: string; translation: string }[];
};

export type AnalysisResult = {
  id: string;
  mode: "text" | "image" | "audio";
  title: string;
  language: string;
  date: string;
  context?: string;
  /** The exact material submitted (text, transcript source, or extracted text). */
  original: string;
  imageUrl?: string;
  imageCaption?: string;
  extractedText?: string;
  transcript?: string;
  audioDuration?: string;
  understood: string;
  recommends: string;
  cefr: string;
  quality: { label: string; score: number; summary: string };
  metrics: Metric[];
  sentences: AnalysedSentence[];
  issues: Issue[];
  strengths: { title: string; detail: string }[];
  naturalness: NaturalnessItem[];
  register: { detected: string; intended: string; mismatch?: string };
  translation: { natural: string; literal: string; notes: string[] };
  pronunciation?: { sound: string; note: string; heardIn: string }[];
  speakingPatterns?: { label: string; detail: string }[];
};

/** Mock dictionary used by the Word Explorer. Keys are lowercase. */
export const lexicon: Record<string, LexiconEntry> = {
  habituer: {
    word: "s'habituer (à)",
    meaning: "to get used to, to grow accustomed to something",
    partOfSpeech: "Reflexive verb (1st group, -er)",
    pronunciation: "/sa.bi.tɥe/",
    cefr: "B1",
    grammar: "Always reflexive in this sense and followed by 'à' + noun or infinitive.",
    examples: [
      { source: "Je m'habitue peu à peu au rythme des cours.", translation: "I'm gradually getting used to the pace of classes." },
      { source: "Elle s'est habituée à parler en public.", translation: "She got used to speaking in public." },
    ],
  },
  chauffage: {
    word: "le chauffage",
    meaning: "heating (the system that warms a building)",
    partOfSpeech: "Noun, masculine",
    pronunciation: "/ʃo.faʒ/",
    cefr: "A2",
    grammar: "Uncountable in most contexts: 'le chauffage', rarely 'des chauffages'.",
    examples: [
      { source: "Le chauffage est en panne depuis samedi.", translation: "The heating has been broken since Saturday." },
      { source: "Peux-tu baisser le chauffage ?", translation: "Can you turn the heating down?" },
    ],
  },
  panne: {
    word: "une panne",
    meaning: "a breakdown, a failure of a machine or system",
    partOfSpeech: "Noun, feminine",
    pronunciation: "/pan/",
    cefr: "B1",
    grammar: "Very common in the fixed phrase 'être en panne' (to be out of order).",
    examples: [
      { source: "L'ascenseur est en panne.", translation: "The lift is out of order." },
      { source: "Nous avons signalé la panne au propriétaire.", translation: "We reported the breakdown to the landlord." },
    ],
  },
  bibliothèque: {
    word: "la bibliothèque",
    meaning: "library (also: a bookcase, at home)",
    partOfSpeech: "Noun, feminine",
    pronunciation: "/bi.bli.jɔ.tɛk/",
    cefr: "A1",
    grammar: "Location uses 'à la bibliothèque', not 'dans la bibliothèque'.",
    examples: [
      { source: "Je révise à la bibliothèque le matin.", translation: "I revise at the library in the morning." },
      { source: "On se retrouve devant la BU ?", translation: "Shall we meet in front of the uni library?" },
    ],
  },
  cours: {
    word: "un cours",
    meaning: "a class, a lesson, a course of study",
    partOfSpeech: "Noun, masculine (invariable)",
    pronunciation: "/kuʁ/",
    cefr: "A1",
    grammar: "'en cours de X' = in an X class; 'avoir cours' = to have class.",
    examples: [
      { source: "Je suis en cours de linguistique.", translation: "I'm in my linguistics class." },
      { source: "Je n'ai pas cours le vendredi.", translation: "I don't have class on Fridays." },
    ],
  },
  manquer: {
    word: "manquer (à quelqu'un)",
    meaning: "to be missed by someone",
    partOfSpeech: "Verb (1st group, -er)",
    pronunciation: "/mɑ̃.ke/",
    cefr: "B1",
    grammar: "The subject is the person or thing missed: 'ma famille me manque' = I miss my family.",
    examples: [
      { source: "Ma famille me manquait tous les jours.", translation: "I missed my family every day." },
      { source: "Tu me manques.", translation: "I miss you." },
    ],
  },
  réparer: {
    word: "réparer",
    meaning: "to repair, to fix something broken",
    partOfSpeech: "Verb (1st group, -er)",
    pronunciation: "/ʁe.pa.ʁe/",
    cefr: "A2",
    grammar: "Transitive: réparer quelque chose. 'faire réparer' = to have something repaired.",
    examples: [
      { source: "Pourriez-vous faire réparer le chauffage ?", translation: "Could you have the heating repaired?" },
      { source: "Il a réparé mon vélo.", translation: "He fixed my bike." },
    ],
  },
  subjonctif: {
    word: "le subjonctif",
    meaning: "the subjunctive mood, used after certain expressions of will, doubt or emotion",
    partOfSpeech: "Noun, masculine",
    pronunciation: "/syb.ʒɔ̃k.tif/",
    cefr: "B1",
    grammar: "Triggered by expressions such as 'il faut que', 'bien que', 'pour que'.",
    examples: [
      { source: "Il faut que je parte.", translation: "I have to leave." },
      { source: "Bien qu'il soit tard, je continue.", translation: "Although it's late, I'm carrying on." },
    ],
  },
  faille: {
    word: "faille",
    meaning: "subjunctive form of 'falloir' (to be necessary)",
    partOfSpeech: "Verb form, present subjunctive",
    pronunciation: "/faj/",
    cefr: "B2",
    grammar: "Appears in 'bien qu'il faille…' — 'although it is necessary…'.",
    examples: [
      { source: "Bien qu'il faille réviser, je sors ce soir.", translation: "Although I need to revise, I'm going out tonight." },
    ],
  },
  temps: {
    word: "le temps",
    meaning: "time; also weather, depending on context",
    partOfSpeech: "Noun, masculine (invariable)",
    pronunciation: "/tɑ̃/",
    cefr: "A1",
    grammar: "The nasal vowel here is /ɑ̃/, not /ɔ̃/ — 'temps' must not sound like 'ton'.",
    examples: [
      { source: "Je n'ai pas eu le temps de réviser.", translation: "I didn't have time to revise." },
      { source: "Avec le temps, ça devient naturel.", translation: "With time, it becomes natural." },
    ],
  },
  linguistique: {
    word: "la linguistique",
    meaning: "linguistics, the study of language",
    partOfSpeech: "Noun, feminine (also an adjective)",
    pronunciation: "/lɛ̃.ɡɥis.tik/",
    cefr: "B2",
    grammar: "As an adjective it agrees: 'une analyse linguistique'.",
    examples: [
      { source: "J'étudie la linguistique à Lyon.", translation: "I study linguistics in Lyon." },
    ],
  },
  disponible: {
    word: "disponible",
    meaning: "available, free (of a person or thing)",
    partOfSpeech: "Adjective",
    pronunciation: "/dis.pɔ.nibl/",
    cefr: "B1",
    grammar: "Agrees in number: disponible / disponibles. Often 'être disponible pour'.",
    examples: [
      { source: "Je suis disponible tous les après-midis.", translation: "I'm available every afternoon." },
    ],
  },
};

export function lookupWord(raw: string): LexiconEntry | undefined {
  const key = raw
    .toLowerCase()
    .replace(/[^a-zàâäçéèêëîïôöùûüÿœæ'’-]/g, "")
    .replace(/^(l|d|j|m|s|t|n|qu)['’]/, "");
  return lexicon[key] ?? lexicon[key.replace(/s$/, "")];
}

const emailText = `Bonjour Madame,

Je vous écris concernant le chauffage dans mon appartement qui ne marche pas depuis samedi. Est-ce que vous pouvez envoyer quelqu'un pour le réparer ? Je suis disponible tous les après-midis cette semaine.

Merci beaucoup,
Alex`;

const monologueTranscript = `J'ai commencé mes études à Lyon en septembre, et au début c'était vraiment difficile de m'habituer. Je pensais à ma famille tous les jours. Après deux mois, j'ai rencontré des amis dans mon cours de linguistique et maintenant je suis très content de être ici. Je vais à la bibliothèque chaque matin pour étudier avant les cours.`;

const notebookText = `Le subjonctif s'emploie après les expressions de volonté, de doute et d'émotion. Il faut que je parte tôt. Bien qu'il fait froid, je vais sortir. Je veux que tu viens avec moi.`;

export const analysisResults: AnalysisResult[] = [
  {
    id: "text-email",
    mode: "text",
    title: "Email to my landlord about the heating",
    language: "French",
    date: "2026-08-29",
    context: "A formal email asking my landlord to repair the heating.",
    original: emailText,
    understood:
      "You are writing formally to your landlord to report that the heating in your flat has been broken since Saturday, asking her to send a technician, and offering your availability for the coming week.",
    recommends:
      "The message already does its job. Lift the politeness formulas into standard formal French — the conditional for the request and a full closing — and this reads like an email written by a native tenant.",
    cefr: "B1+",
    quality: {
      label: "Clear and effective, one register step from formal",
      score: 78,
      summary:
        "Grammar and spelling are essentially clean. The gap is conventional formality: your phrasing is polite but spoken, and French written correspondence expects fixed formulas.",
    },
    metrics: [
      { label: "Grammar accuracy", value: 92, note: "No structural errors across four sentences." },
      { label: "Spelling", value: 100, note: "Accents and elisions all correct." },
      { label: "Vocabulary range", value: 64, note: "Everyday words; 'panne' and 'intervenir' would raise it." },
      { label: "Register control", value: 58, note: "Aimed formal, landed neutral-polite." },
      { label: "Sentence complexity", value: 71, note: "Good relative clause in the opening sentence." },
    ],
    sentences: [
      {
        id: "s1",
        segments: [
          { text: "Bonjour Madame," },
        ],
      },
      {
        id: "s2",
        segments: [
          { text: "Je vous écris concernant le chauffage dans mon appartement " },
          { text: "qui ne marche pas depuis samedi", issueId: "i-marche" },
          { text: "." },
        ],
      },
      {
        id: "s3",
        segments: [
          { text: "Est-ce que vous pouvez envoyer quelqu'un", issueId: "i-request" },
          { text: " pour le réparer ?" },
        ],
      },
      {
        id: "s4",
        segments: [{ text: "Je suis disponible tous les après-midis cette semaine." }],
      },
      {
        id: "s5",
        segments: [
          { text: "Merci beaucoup,", issueId: "i-closing" },
          { text: " Alex" },
        ],
      },
    ],
    issues: [
      {
        id: "i-request",
        youWrote: "Est-ce que vous pouvez envoyer quelqu'un",
        better: "Pourriez-vous envoyer quelqu'un",
        why: "Nothing here is wrong. In formal written French, though, a request is normally softened with the conditional. 'Pourriez-vous' asks the same thing while leaving the reader room to answer — 'est-ce que vous pouvez' sounds like a spoken question addressed to someone you know.",
        category: "Register",
        confidence: "High",
        severity: "suggestion",
        examples: [
          { source: "Pourriez-vous me confirmer la date ?", gloss: "Could you confirm the date for me?" },
          { source: "Serait-il possible d'intervenir cette semaine ?", gloss: "Would it be possible to come this week?" },
          { source: "Je vous saurais gré de bien vouloir faire réparer le chauffage.", gloss: "I would be grateful if you would have the heating repaired. (very formal)" },
        ],
      },
      {
        id: "i-marche",
        youWrote: "qui ne marche pas depuis samedi",
        better: "qui est en panne depuis samedi",
        why: "'Marcher' for a device is correct and extremely common in speech. In a written complaint, 'être en panne' is the expected term and signals the problem is a fault rather than a temporary annoyance.",
        category: "Vocabulary",
        confidence: "Medium",
        severity: "info",
        examples: [
          { source: "L'ascenseur est en panne depuis lundi.", gloss: "The lift has been out of order since Monday." },
          { source: "La chaudière ne fonctionne plus.", gloss: "The boiler no longer works. (neutral written alternative)" },
        ],
      },
      {
        id: "i-closing",
        youWrote: "Merci beaucoup,",
        better: "Je vous remercie par avance. Cordialement,",
        why: "French formal letters close with a set formula, not a bare thank-you. This is convention rather than grammar: readers notice its absence the way an English reader notices a missing 'Kind regards'.",
        category: "Register",
        confidence: "High",
        severity: "suggestion",
        examples: [
          { source: "Je vous remercie par avance de votre retour. Cordialement, Alex", gloss: "Thank you in advance for your reply. Best regards, Alex" },
          { source: "Dans l'attente de votre réponse, bien à vous.", gloss: "Looking forward to your reply, yours sincerely." },
        ],
      },
    ],
    strengths: [
      {
        title: "You gave the reader everything needed to act",
        detail:
          "Problem, start date, requested action and your availability, in that order. Many learners omit the date or the availability, which forces a second email.",
      },
      {
        title: "The relative clause is handled correctly",
        detail: "'le chauffage … qui ne marche pas' attaches cleanly to the right noun, with correct 'qui' as subject.",
      },
      {
        title: "Consistent 'vous' throughout",
        detail: "No slip into 'tu', which is a common lapse once a message gets longer.",
      },
    ],
    naturalness: [
      {
        verdict: "Natural",
        phrase: "Je vous écris concernant le chauffage…",
        note: "Exactly how a French tenant opens this kind of message.",
      },
      {
        verdict: "Correct but unnatural",
        phrase: "Est-ce que vous pouvez envoyer quelqu'un ?",
        note: "Grammatically perfect, but spoken in flavour for a written request.",
        suggestion: "Pourriez-vous envoyer quelqu'un ?",
      },
      {
        verdict: "Correct but unnatural",
        phrase: "Merci beaucoup, Alex",
        note: "Understood, but abrupt as a formal sign-off.",
        suggestion: "Je vous remercie par avance. Cordialement, Alex",
      },
    ],
    register: {
      detected: "Neutral-polite written French",
      intended: "Formal correspondence with a landlord",
      mismatch:
        "Two spoken-register formulas (the request and the sign-off) pull an otherwise formal email one step down. Content and address forms are already at the right level.",
    },
    translation: {
      natural:
        "Dear Madam, I'm writing about the heating in my flat, which has been out of order since Saturday. Could you send someone to repair it? I'm available every afternoon this week. Thank you in advance. Kind regards, Alex",
      literal:
        "Hello Madam, I you write concerning the heating in my flat which not works not since Saturday. Is it that you can send someone to repair it? I am available all the afternoons this week. Thank you much, Alex",
      notes: [
        "'Bonjour Madame' is genuinely standard in French formal email; the English equivalent is 'Dear Madam', not 'Hello Madam'.",
        "French 'ne … pas' has no English counterpart word-for-word; the literal line keeps it to show the structure.",
      ],
    },
  },
  {
    id: "audio-monologue",
    mode: "audio",
    title: "Monologue about my university experience",
    language: "French",
    date: "2026-08-28",
    context: "I'm recording a five-minute monologue about my university experience.",
    original: monologueTranscript,
    transcript: monologueTranscript,
    audioDuration: "4:52",
    understood:
      "You describe arriving in Lyon in September, finding the first weeks hard, missing your family, meeting friends in your linguistics course, and your current habit of studying at the library each morning.",
    recommends:
      "Your storytelling holds together well. Focus on two things: the elision 'de être' → 'd'être', and the nasal vowel /ɑ̃/, which currently drifts towards /ɔ̃/ and makes 'temps' sound like 'ton'.",
    cefr: "B1",
    quality: {
      label: "Fluent personal narrative with a few mechanical slips",
      score: 74,
      summary:
        "You sustained five minutes without switching to English and kept your tenses consistent. The issues are small and repeatable: one elision, one preposition, and one recurring vowel.",
    },
    metrics: [
      { label: "Grammar accuracy", value: 84, note: "Passé composé and imparfait used correctly throughout." },
      { label: "Pronunciation", value: 61, note: "Nasal vowels are the main obstacle to sounding French." },
      { label: "Vocabulary range", value: 70, note: "Everyday register, well controlled." },
      { label: "Fluency and pacing", value: 77, note: "Few hesitations; slowing appears before prepositions." },
      { label: "Register control", value: 82, note: "Neutral spoken register, right for the task." },
    ],
    sentences: [
      {
        id: "a1",
        segments: [
          { text: "J'ai commencé mes études à Lyon en septembre, et au début c'était vraiment difficile de m'habituer." },
        ],
      },
      {
        id: "a2",
        segments: [
          { text: "Je pensais à ma famille tous les jours", issueId: "i-manquer" },
          { text: "." },
        ],
      },
      {
        id: "a3",
        segments: [
          { text: "Après deux mois, j'ai rencontré des amis " },
          { text: "dans mon cours de linguistique", issueId: "i-encours" },
          { text: " et maintenant je suis très content " },
          { text: "de être ici", issueId: "i-elision" },
          { text: "." },
        ],
      },
      {
        id: "a4",
        segments: [{ text: "Je vais à la bibliothèque chaque matin pour étudier avant les cours." }],
      },
    ],
    issues: [
      {
        id: "i-elision",
        youWrote: "je suis très content de être ici",
        better: "je suis très content d'être ici",
        why: "French removes the vowel of 'de' before another vowel sound and joins the words: 'd'être'. In speech this is automatic — leaving both vowels creates a small break that immediately marks the sentence as non-native.",
        category: "Spelling",
        confidence: "High",
        severity: "error",
        examples: [
          { source: "Je suis content d'être ici.", gloss: "I'm happy to be here." },
          { source: "Il essaie d'apprendre.", gloss: "He's trying to learn." },
          { source: "C'est difficile d'expliquer.", gloss: "It's hard to explain." },
        ],
      },
      {
        id: "i-encours",
        youWrote: "dans mon cours de linguistique",
        better: "en cours de linguistique",
        why: "When 'cours' means the class you attend rather than a physical room, French uses 'en cours de'. 'Dans' keeps the literal sense of being inside something, which is why it sounds odd here.",
        category: "Grammar",
        confidence: "High",
        severity: "suggestion",
        examples: [
          { source: "Je l'ai rencontrée en cours d'histoire.", gloss: "I met her in history class." },
          { source: "On en a parlé en cours.", gloss: "We talked about it in class." },
        ],
      },
      {
        id: "i-manquer",
        youWrote: "Je pensais à ma famille tous les jours",
        better: "Ma famille me manquait tous les jours",
        why: "Your sentence is correct and means 'I thought about my family'. If you mean you missed them, French flips the subject: the person missed does the missing. This is the structure English speakers most often avoid because it feels backwards.",
        category: "Naturalness",
        confidence: "Context-dependent",
        severity: "suggestion",
        examples: [
          { source: "Ma famille me manque.", gloss: "I miss my family." },
          { source: "Tu me manques.", gloss: "I miss you." },
          { source: "Lyon me manquera.", gloss: "I'll miss Lyon." },
        ],
      },
    ],
    strengths: [
      {
        title: "Tense discipline across five minutes",
        detail:
          "You alternated passé composé for events and imparfait for background states without a single slip — that distinction is exactly where B1 speakers usually wobble.",
      },
      {
        title: "You told a story, not a list",
        detail: "Arrival, difficulty, turning point, present routine. The listener always knows where they are in time.",
      },
      {
        title: "You self-corrected once and kept going",
        detail: "At 2:14 you restarted a clause and recovered without switching to English.",
      },
    ],
    naturalness: [
      { verdict: "Incorrect", phrase: "de être ici", note: "Missing elision — never written or said this way.", suggestion: "d'être ici" },
      { verdict: "Correct but unnatural", phrase: "dans mon cours de linguistique", note: "Understood, but a French speaker says 'en cours de'.", suggestion: "en cours de linguistique" },
      { verdict: "Natural", phrase: "au début c'était vraiment difficile", note: "Idiomatic and well placed." },
      { verdict: "Natural", phrase: "je vais à la bibliothèque chaque matin", note: "Correct preposition and a natural rhythm." },
    ],
    register: {
      detected: "Neutral spoken French, lightly formal",
      intended: "A monologue for a tutor",
      mismatch:
        "No mismatch. You avoided both slang and textbook stiffness, which is the right level for an assessed spoken task.",
    },
    translation: {
      natural:
        "I started my studies in Lyon in September, and at first it was really hard to settle in. I missed my family every day. After two months I made friends in my linguistics class, and now I'm very happy to be here. I go to the library every morning to study before class.",
      literal:
        "I have started my studies at Lyon in September, and at the beginning it was really difficult to get used. I was thinking about my family all the days. After two months, I have met friends in my course of linguistics and now I am very happy of to be here. I go to the library each morning for to study before the classes.",
      notes: [
        "'tous les jours' is 'every day', not 'all the days' — a fixed expression.",
        "French 'pour + infinitive' becomes plain 'to + verb' in English.",
      ],
    },
    pronunciation: [
      { sound: "/ɑ̃/ as in 'temps'", note: "Produced closer to /ɔ̃/, so 'temps' leans towards 'ton'. Drop the jaw slightly and keep the lips unrounded.", heardIn: "temps, septembre, content" },
      { sound: "Final consonants", note: "You occasionally sound the final 's' in plurals. 'mes études' should end on the vowel.", heardIn: "mes études, les cours" },
      { sound: "Liaison", note: "Liaisons are made reliably and at the right moments — no action needed.", heardIn: "mes_études, très_content" },
    ],
    speakingPatterns: [
      { label: "Pace drops before prepositions", detail: "Three of four hesitations occur immediately before 'à', 'dans' or 'de' — the same place your written errors cluster." },
      { label: "Sentence length is consistent", detail: "Average 14 words; you rarely trail off, which keeps the monologue easy to follow." },
      { label: "Filler use is low", detail: "Six instances of 'euh' in five minutes, well below typical for this level." },
    ],
  },
  {
    id: "image-notebook",
    mode: "image",
    title: "Handwritten class notes on the subjunctive",
    language: "French",
    date: "2026-08-27",
    context: "A page of my notebook from a grammar lesson on the subjunctive.",
    original: notebookText,
    imageUrl: notebookImage,
    imageCaption: "Photograph of a notebook page with handwritten French practice sentences.",
    extractedText: notebookText,
    understood:
      "You wrote down the rule for when the subjunctive is used, then three practice sentences applying it. Two of the three practice sentences use the indicative where the subjunctive is required.",
    recommends:
      "Your rule statement is accurate — the gap is applying it under pressure. Rewrite the two failing sentences from memory, then look for the same triggers in your next piece of writing.",
    cefr: "B1",
    quality: {
      label: "Correct rule, inconsistent application",
      score: 66,
      summary:
        "You know which expressions trigger the subjunctive; the verb forms are where it breaks down. That is a conjugation-retrieval problem, not a comprehension problem, and it responds quickly to practice.",
    },
    metrics: [
      { label: "Text recognition confidence", value: 88, note: "Handwriting read cleanly; check the third line if it looks wrong." },
      { label: "Grammar accuracy", value: 55, note: "Two of three practice sentences use the wrong mood." },
      { label: "Spelling", value: 96, note: "Accents placed correctly throughout." },
      { label: "Rule understanding", value: 90, note: "Your written rule is accurate and well phrased." },
    ],
    sentences: [
      {
        id: "n1",
        segments: [
          { text: "Le subjonctif s'emploie après les expressions de volonté, de doute et d'émotion." },
        ],
      },
      { id: "n2", segments: [{ text: "Il faut que je parte tôt." }] },
      {
        id: "n3",
        segments: [
          { text: "Bien qu'il fait froid", issueId: "i-bienque" },
          { text: ", je vais sortir." },
        ],
      },
      {
        id: "n4",
        segments: [
          { text: "Je veux que tu viens avec moi", issueId: "i-vouloir" },
          { text: "." },
        ],
      },
    ],
    issues: [
      {
        id: "i-bienque",
        youWrote: "Bien qu'il fait froid",
        better: "Bien qu'il fasse froid",
        why: "'Bien que' always takes the subjunctive, even when the fact is certain. That is what trips learners up: it feels wrong to use a 'doubt' mood for something obviously true, but the trigger is the conjunction, not the meaning.",
        category: "Grammar",
        confidence: "High",
        severity: "error",
        examples: [
          { source: "Bien qu'il fasse froid, je sors.", gloss: "Although it's cold, I'm going out." },
          { source: "Bien que ce soit difficile, ça vaut la peine.", gloss: "Although it's hard, it's worth it." },
        ],
      },
      {
        id: "i-vouloir",
        youWrote: "Je veux que tu viens avec moi",
        better: "Je veux que tu viennes avec moi",
        why: "'Vouloir que' expresses will over someone else's action, so the second clause goes into the subjunctive. Note the sound change: 'viens' /vjɛ̃/ becomes 'viennes' /vjɛn/.",
        category: "Grammar",
        confidence: "High",
        severity: "error",
        examples: [
          { source: "Je veux que tu viennes.", gloss: "I want you to come." },
          { source: "Elle voudrait que nous partions plus tôt.", gloss: "She'd like us to leave earlier." },
        ],
      },
    ],
    strengths: [
      {
        title: "Your rule statement is genuinely correct",
        detail: "Volonté, doute, émotion — that is the standard triad, phrased in your own words rather than copied.",
      },
      {
        title: "'Il faut que je parte' is right",
        detail: "An irregular subjunctive produced correctly, which shows the form is available to you when the trigger is familiar.",
      },
      {
        title: "You practise by writing your own sentences",
        detail: "Testing a rule on new sentences instead of recopying examples is why the gap showed up here rather than in an exam.",
      },
    ],
    naturalness: [
      { verdict: "Incorrect", phrase: "Bien qu'il fait froid", note: "The mood is wrong after 'bien que'.", suggestion: "Bien qu'il fasse froid" },
      { verdict: "Incorrect", phrase: "Je veux que tu viens", note: "'Vouloir que' requires the subjunctive.", suggestion: "Je veux que tu viennes" },
      { verdict: "Natural", phrase: "Il faut que je parte tôt.", note: "Exactly as a French speaker would say it." },
    ],
    register: {
      detected: "Neutral written French (study notes)",
      intended: "Personal notes for revision",
      mismatch: "No mismatch — concise note-taking style is appropriate here.",
    },
    translation: {
      natural:
        "The subjunctive is used after expressions of will, doubt and emotion. I have to leave early. Although it's cold, I'm going out. I want you to come with me.",
      literal:
        "The subjunctive itself employs after the expressions of will, of doubt and of emotion. It is necessary that I leave early. Although it makes cold, I go to go out. I want that you come with me.",
      notes: [
        "'il fait froid' is literally 'it makes cold' — French uses 'faire' for weather.",
        "English replaces the French 'que' clause with an infinitive: 'I want you to come'.",
      ],
    },
  },
];

export function getResult(id: string) {
  return analysisResults.find((r) => r.id === id);
}

export const resultForMode: Record<"text" | "image" | "audio", string> = {
  text: "text-email",
  image: "image-notebook",
  audio: "audio-monologue",
};
