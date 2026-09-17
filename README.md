# MockHire

MockHire is an experimental AI system that acts as an intelligent observer during a candidate's interview. It is not a traditional chatbot or interview form—it is a "neural observation" interface designed to make the AI's evaluation process visible, feeling like an advanced research instrument rather than a generic SaaS application.

The platform provides a cinematic, spatial experience that dynamically displays:
- **Human Input:** The candidate's spoken responses.
- **Thought Structure:** Concepts and logic extracted from the answers.
- **Machine Observation:** Real-time AI evaluation metrics and detected skills.

## Use Cases

MockHire serves as a dual-purpose platform, providing immense value to both hiring teams (HR) and candidates:

### For HR & Recruiters
- **Bulk Processing:** HR can dump candidate applications (resumes and job descriptions) into the system for autonomous pre-screening.
- **Automated Verification:** The engine independently verifies a candidate's claims by inspecting their GitHub repositories, looking for concrete proof of their skills before the interview even starts.
- **Data-Driven Hiring:** Provides a comprehensive "Readiness Score" and detailed hiring reports, saving hours of manual resume review and technical screening.

### For Candidates
- **Direct Interaction:** The system can be exposed as a public-facing interface where candidates directly interact with the AI to take their assessments.
- **Fair Evaluation:** Candidates get a chance to verbally and technically prove the skills on their resume during the live AI interview, ensuring they are evaluated on actual knowledge rather than just keywords.
- **Unique Experience:** Offers a cinematic, engaging interview environment where candidates can see the AI understanding their thoughts and logic in real-time.

## System Workflow & Architecture

To help recruiters and technical evaluators understand how MockHire functions under the hood, here is the lifecycle from resume submission to the final readiness report. It highlights the integration between standard REST APIs and the real-time WebSocket connection used during the live interview.

```mermaid
sequenceDiagram
    participant C as Client (Frontend)
    participant API as Assessment API (Server)
    participant O as Agent Orchestrator
    participant DB as MongoDB
    participant GH as External Services (GitHub/LLMs)
    participant WS as Gemini Live (WebSocket)

    %% Initialization & Prerequisites
    Note over C, WS: Phase 1: Pre-Interview Assessment & Setup
    C->>API: Submit Resume & Job Description (HTTP POST)
    API->>O: Start Assessment Lifecycle
    O->>DB: Save Initial State (Status: running)
    O->>GH: Deterministic Parse (Resume, JD, Repos)
    GH-->>O: Parsed Profile & Repository List
    
    %% Investigation & Evidence Gathering
    O->>GH: LLM-Directed Investigation (Inspect Repos)
    GH-->>O: Evidence & Gap Analysis
    
    %% Preparation
    O->>DB: Build Verification Context & Create Interview Doc
    O-->>API: Assessment Ready (Status: awaiting_interview)
    API-->>C: Ready to Start Interview

    %% Interview Phase
    Note over C, WS: Phase 2: Live AI Interview (Neural Observation)
    C->>WS: Connect via WebSocket (Live Audio/Text streaming)
    WS->>DB: Fetch Interview Doc & Context
    
    loop Real-time Interaction
        C->>WS: Candidate Speech (Audio stream)
        WS-->>C: Dynamic UI Updates (Concepts, Skills, AI Speech)
    end
    
    WS->>DB: Save Interview Transcript & QA Data
    WS-->>C: WebSocket Disconnected (Interview Completed)

    %% Evaluation & Reporting
    Note over O, DB: Phase 3: Post-Interview Evaluation
    O->>DB: Fetch Complete Transcript
    O->>GH: Batch Evaluation & Score Calculation (LLM)
    O->>DB: Save Candidate Report & Hiring Report (Status: completed)
    DB-->>C: Fetch Final Readiness Score & Reports
```

## Features

- **Live Speech-to-Text & Analysis:** Converts user speech into structured concepts dynamically.
- **"The Core" Interface:** A living visual representation of the active intelligence (Idle, Listening, Processing, Speaking).
- **Cinematic Flow:** Smooth, spatial transitions between questions rather than sudden swaps.
- **Non-Chatbot Interaction:** Answers form flowing documents; observations appear as instrumentation.

## Tech Stack

### Client (Frontend)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Shadcn UI
- **Animations:** Framer Motion
- **Authentication:** Clerk
- **State/Fetching:** React Query + Axios
- **Real-time:** WebSockets

### Server (Backend)
- **Framework:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **AI Integrations:** Google GenAI, Groq SDK
- **File Parsing:** Multer, pdf-parse, mammoth
- **Real-time:** WebSockets

## Getting Started

### Prerequisites
- Node.js
- MongoDB instance
- Clerk API Keys
- Gemini / Groq API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Setup the Server:**
   ```bash
   cd Server
   npm install
   # Create a .env file and add your environment variables (MongoDB URI, API Keys, etc.)
   npm run dev
   ```

3. **Setup the Client:**
   ```bash
   cd ../Client
   npm install
   # Create a .env file with your Vite Clerk keys, API URLs, etc.
   npm run dev
   ```

## Architecture & Design Guidelines

For a deep dive into the system design, UI philosophy, and AI integration boundaries, refer to:
- [`design.md`](./design.md) - UI philosophy and visual direction.
- [`architecture.md`](./architecture.md) - System architecture and component reuse.