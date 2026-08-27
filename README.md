# Lexion: Your Language Workspace

I want to build a web application called "Lexion".

Spell the name exactly:

L-I-X-E-O-N

Lexion is an AI-powered personal language analysis and improvement workspace.

CORE PRODUCT IDEA:

"Understand your language. Improve through your own mistakes."

Lexion allows a language learner to submit different forms of language they have produced or encountered:

- typed text

- pasted text

- photographs/scanned text

- audio recordings

- audio transcripts

- essays

- paragraphs

- letters

- emails

- monologues

- conversations

- other language material

Lexion analyses the submitted material and helps the learner understand:

- grammar

- spelling

- vocabulary

- syntax

- pronunciation

- naturalness

- register

- linguistic nuance

- translation

- contextual meaning

- what they did correctly

- what they need to improve

- recurring mistakes

The product is NOT a traditional language-learning app.

Do NOT create:

- generic language lessons

- games

- XP

- streaks

- leaderboards

- hearts/lives

- coins

- gamified lesson paths

- daily lesson systems

Instead, Lexion learns from the user's own language and creates personalised study material based on their recurring weaknesses.

CORE PRODUCT LOOP:

Submit something

→ Lexion analyses it

→ Lexion explains it

→ Lexion remembers recurring issues

→ Lexion creates personalised study notes

→ User reviews the notes

→ User submits something again

VISUAL DIRECTION:

Lexion should feel:

- elegant

- intelligent

- calm

- modern

- friendly

- educational

- slightly editorial

- premium

- approachable

The interface can have subtle personality, but it should NOT look like a children's language-learning game.

Use Duolingo only as inspiration for:

- clarity

- friendliness

- approachable explanations

- understandable feedback

Do NOT copy Duolingo's visual identity.

COLOUR SYSTEM:

Use a restrained palette.

Primary background:

warm off-white / very light neutral

Primary text:

deep charcoal

Primary accent:

sophisticated green

Secondary accent:

muted blue

Supporting accent:

subtle warm yellow/gold

Semantic colours:

red/orange = error

amber = suggestion

green = correct

blue = information

Do not use excessive colours.

Do not use colour alone to communicate meaning.

TYPOGRAPHY:

Use a clean modern sans-serif such as:

Inter, Geist, or Plus Jakarta Sans.

Use strong typographic hierarchy and generous whitespace.

UI STYLE:

- elegant cards

- moderate rounded corners

- subtle shadows

- thin borders

- generous whitespace

- clean iconography

- subtle micro-interactions

- minimal gradients

- no excessive glassmorphism

- no excessive animation

- no cartoon-heavy illustrations

APPLICATION STRUCTURE:

Create these main routes:

1. /dashboard

2. /analyse

3. /history

4. /study

5. /mistakes

6. /progress

7. /languages

8. /profile

PERSISTENT NAVIGATION:

Desktop sidebar:

Lexion logo

Home

Analyse

History

Study Notes

Mistake Bank

Progress

Languages

Bottom:

Profile

Settings

On mobile, create an intentional mobile navigation system.

DASHBOARD:

Create a clean dashboard.

Header:

"Welcome back."

Subheading:

"Understand your language. Improve through your own work."

Primary CTA:

"Analyse something"

Create a section called:

"Jump back in"

This is NOT a lesson section.

It is the user's personal history preview.

Show the most recent submissions, including different submission types:

- Text

- Image

- Audio

- Transcript

- Translation

Each item should show:

- title or automatically generated short title

- language

- submission type

- date

- short preview

- analysis status

The user should be able to click an item and reopen its complete historical analysis.

Create a small "Your language" section showing:

- active language

- estimated CEFR level

- recent improvement

- most frequent issue

Create a "Study notes" preview showing the most recently generated personalised study material.

Create a "What Lexion has noticed" card showing one recurring language pattern.

Do NOT show:

- XP

- streak

- achievements

- daily challenges

- generic lessons

ANALYSE:

Create the main submission workspace.

The user should be able to choose:

Input type:

- Text

- Image

- Audio

Language:

French

English

Spanish

German

Italian

etc.

Context:

Optional

The context field should be strongly encouraged but NOT compulsory.

For example:

"What is this about?"

Placeholder:

"Example: A 5-minute monologue about my university experience."

Explain why context can help:

"Context helps Lexion understand what you are trying to communicate and give more relevant feedback."

TEXT INPUT:

Allow:

- typing

- pasting

IMAGE INPUT:

Allow image upload.

For now, show OCR as coming soon.

AUDIO INPUT:

Allow audio upload.

For now, show audio analysis as coming soon.

ANALYSE button:

"Analyse"

HISTORY:

Create a complete history page.

Every user submission should eventually appear here.

Submission types:

Text

Image

Audio

Transcript

Translation

Each item should show:

- date

- language

- type

- title

- preview

- analysis status

Allow filtering by:

- language

- input type

- date

- analysed/not analysed

When a user clicks an item, they should see:

ORIGINAL INPUT

The exact material they submitted.

Then:

LEXION'S INTERPRETATION

What Lexion understood.

Then:

ANALYSIS

Corrections

Strengths

Naturalness

Register

Vocabulary

Translation

Other relevant observations

The history should preserve the complete analysis so the user can return later.

STUDY:

Create a page called:

"Study Notes"

This is NOT a generic lesson system.

It contains personalised material generated specifically from the user's recurring mistakes.

Example:

"Your French: Prepositions"

Then a concise study note containing:

The rule

Why you tend to make this mistake

Correct examples

Incorrect examples

Natural alternatives

Useful vocabulary

A short summary

Study notes should be generated from actual user data.

If the user has insufficient data, show:

"Lexion is still learning your language patterns. Analyse more of your own writing or speech to build your personalised study material."

MISTAKE BANK:

Create a page for recurring language problems.

Categories:

- Grammar

- Spelling

- Vocabulary

- Syntax

- Pronunciation

- Naturalness

- Register

- Other

Show:

- recurring mistake

- number of occurrences

- last occurrence

- estimated mastery/understanding

- language

PROGRESS:

Create a progress dashboard.

Do NOT use XP, streaks or gamification.

Instead track meaningful language development:

- grammar accuracy

- spelling accuracy

- vocabulary development

- naturalness

- pronunciation

- writing complexity

- recurring mistake reduction

- estimated CEFR level

Show progress over:

7 days

30 days

90 days

Use calm, elegant data visualisation.

LANGUAGES:

Show:

- My languages

- Current level

- Target level

- Language variant where relevant

For French, allow the user eventually to choose:

France

Canada

Belgium

Switzerland

International/unspecified

PROFILE:

Include:

- account

- native language

- learning languages

- current level

- learning goals

- preferred explanation depth

- preferred correction style

- settings

IMPORTANT PRODUCT PRINCIPLE:

Lexion should never make the learner feel stupid.

The tone should be:

"Here's what happened."

"Here's why."

"Here's what you did well."

"Here's what you can improve."

"Here's something useful to remember."

For now:

- use mock data

- do not implement real AI

- do not implement Firebase

- do not implement authentication

- do not implement OCR

- do not implement audio analysis

Focus entirely on establishing the product foundation and visual system.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c17aa4a5-a1fd-4dde-990f-a4f296f0fcf7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
