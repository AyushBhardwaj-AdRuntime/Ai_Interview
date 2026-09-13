# MOCKHIRE — NEURAL OBSERVATION

## Core Concept

MockHire is not a chatbot interface.

It is an AI system observing a human think.

The interface should make the user feel:

> "The machine is watching my answer become an answer."

The experience should feel closer to an experimental AI research instrument than a traditional interview platform.

Do NOT design this like:
- a chatbot
- a Zoom call
- a dashboard
- a normal interview form
- a generic SaaS application
- a typical AI assistant

The interface should feel alive, intelligent, cinematic, and slightly mysterious.

---

# 1. DESIGN PHILOSOPHY

Everything visible on screen should communicate one of three layers:

### HUMAN
What the candidate is actually saying.

### THOUGHT
Concepts and structure emerging from what they say.

### MACHINE
What the evaluation system is observing.

These layers should visually interact.

The UI should make invisible processes feel visible without pretending to expose private LLM reasoning.

Never display fake chain-of-thought.

Instead show legitimate observable signals such as:
- detected concepts
- skills
- response structure
- answer length
- speech activity
- question progress
- evaluation dimensions
- confidence/coverage indicators when actually available

---

# 2. VISUAL DIRECTION

Primary aesthetic:

Vercel Dark + Experimental AI Instrument + subtle Cyberpunk.

Not full cyberpunk.

Avoid:
- excessive neon
- gaming HUD aesthetics
- giant glowing borders
- rainbow gradients
- excessive glassmorphism
- generic purple AI branding
- meaningless random data

The interface should feel expensive and intentional.

---

# 3. COLOR SYSTEM

Base:

- Background: near-black / zinc-950
- Primary text: white
- Secondary text: zinc-400
- Muted text: zinc-600
- Borders: zinc-800 with low opacity

Accent colors:

- Violet → AI / intelligence
- Cyan → human voice / live input
- White → important information
- Amber → attention / uncertainty
- Red → errors only

Use color sparingly.

The screen should remain mostly dark and calm.

Glow should be atmospheric rather than decorative.

---

# 4. TYPOGRAPHY

Do not make every element use the same typography.

Use typography as part of the interaction.

Recommended hierarchy:

### Interview Question
Large editorial typography.

It should feel like a statement rather than a UI label.

Example:

"How would you scale this system?"

### User Transcript
Large but lighter typography.

The candidate's words should feel human and fluid.

### Machine Observations
Small monospaced typography.

Example:

OBSERVATION / RESPONSE STRUCTURE

### Metadata
Tiny uppercase technical typography with generous letter spacing.

Example:

QUESTION 03
LIVE INPUT
02:41

Possible fonts:
- Inter
- Geist
- Space Grotesk
- IBM Plex Mono

Use a combination rather than one font everywhere.

---

# 5. LAYOUT

Do NOT create a conventional three-column dashboard.

The layout should feel spatial.

Primary composition:

        MACHINE SPACE

              QUESTION

                 ↓

              AI CORE

        HUMAN / TRANSCRIPT

The center should contain the primary visual focus.

Supporting information should orbit or emerge around the central experience.

Use asymmetry.

Allow large empty spaces.

Negative space is important.

---

# 6. THE AI CORE

The center visual is called:

## THE CORE

It represents the active intelligence of the interview.

It should not simply be a circle.

It should behave like a living system.

Possible visual language:
- particles
- soft energy field
- waveform
- expanding rings
- fluid geometry
- SVG/canvas structures
- orbital points
- subtle noise
- dynamic gradients

The Core has states:

### IDLE
Almost still.

### LISTENING
Responds to user voice.

Cyan/human energy.

### AI SPEAKING
More structured movement.

Violet/intelligence energy.

### THINKING / PROCESSING
Subtle internal movement.

### ERROR
Controlled red signal.

Do not over-animate.

Motion should communicate state.

---

# 7. VOICE → VISUAL INFORMATION

Voice should create visual structure.

Do not use a generic audio waveform.

When the candidate speaks:

voice
↓
energy
↓
particles
↓
concepts
↓
structure

The interface should feel like raw speech is becoming structured information.

If actual audio amplitude is available, use it.

If not, create deterministic UI states rather than fake random activity.

---

# 8. TRANSCRIPT

The transcript should not look like chat bubbles.

Never use:

User:
AI:

Instead:

The candidate's speech appears as flowing editorial text.

Example:

"I would start by separating the workload..."

As important concepts are detected, they may subtly become highlighted or form visual nodes.

The transcript should feel like a document being created live.

---

# 9. MACHINE OBSERVATION

Machine observations should appear subtly.

Example:

OBSERVATION

technical specificity     ████████░░
concept coverage          ██████░░░░
response structure        ████████░░

Or:

DETECTED
React
Redis
WebSocket
MongoDB

These should feel like instrumentation, not a fake hacking terminal.

Never invent AI reasoning.

---

# 10. SILENCE

Silence is a first-class UI state.

When the candidate stops speaking:

The Core slows down.

The interface becomes quieter.

Show subtle timing:

02.7s

thinking...

When speech resumes, the system wakes up.

Silence should feel intentional rather than like loading.

---

# 11. QUESTION TRANSITION

Questions should not simply disappear and get replaced.

Use cinematic spatial transitions.

Example:

QUESTION 02

How would you scale this?

↓

fades / moves / dissolves

↓

QUESTION 03

What would you change if latency doubled?

The transition should make the interview feel like progression through an experience.

---

# 12. END OF INTERVIEW

The ending is important.

Do not immediately show:

Score: 82/100

Instead transition from:

INTERVIEW MODE

to:

OBSERVATION COMPLETE

Then reveal the candidate's evaluation progressively.

The interface should feel like:

"The machine has finished observing."

Possible final statement:

> We watched how you arrived at your answers.

Then reveal:
- technical depth
- communication
- reasoning
- adaptability
- strengths
- areas for improvement

The final screen should feel like a reveal, not a report card.

---

# 13. MOTION PRINCIPLES

Use Framer Motion where already available.

Motion should have meaning.

Every animation should communicate one of:

- speech
- thought
- transition
- observation
- progress
- completion

Avoid:
- random bouncing
- excessive hover animations
- meaningless particles
- constant movement
- animation everywhere

The interface should sometimes become completely still.

Contrast makes motion powerful.

---

# 14. INTERACTION

Buttons should be minimal.

Primary action:

END INTERVIEW

Secondary controls should remain quiet.

Do not fill the screen with controls.

The candidate should focus on the conversation.

---

# 15. RESPONSIVENESS

Desktop is the primary hackathon presentation.

But the experience must degrade gracefully on smaller screens.

Do not simply shrink the desktop layout.

Recompose it.

---

# 16. TECHNICAL CONSTRAINTS

Use the existing project architecture.

Preferred:
- React
- TypeScript
- Tailwind
- Framer Motion
- existing audio/WebSocket architecture

Do NOT rewrite backend logic.

Do NOT modify Gemini event handling unless explicitly required.

Do NOT replace working interview functionality just to achieve visual effects.

The UI is a layer over the existing interview engine.

---

# 17. MOST IMPORTANT RULE

Do not optimize for:

"Looks like a polished SaaS app."

Optimize for:

"I have never seen an interview interface behave like this before."

The design should be memorable without becoming confusing.

Experimental, but usable.

Beautiful, but meaningful.

Technical, but human.

Minimal, but alive.