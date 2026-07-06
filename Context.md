# AI-Assisted Custom Mechanical Keyboard Configuration Platform: Requirements & Specifications

## 1. Platform Overview
The platform is a web-based custom mechanical keyboard configurator designed to bridge the "semantic gap" for beginners while streamlining the workflow for experts. By integrating Generative AI with a strict rule-based logic engine, the application democratizes keyboard customization. It eliminates choice overload by translating abstract user preferences (e.g., "I want a thocky, quiet keyboard") into technically sound, compatible component recommendations.

## 2. Target Audience & User Personas
- **Novice Users (Sarah):** Lacks domain knowledge. Driven by sensory desires (sound, feel) rather than technical specifications. Requires a guided experience, jargon translation, and AI assistance to prevent incompatible purchases.
- **Expert Enthusiasts (Alex):** Has deep domain knowledge. Values speed, performance, and flexibility. Needs a robust sandbox mode, smart parametric filters, and immediate compatibility validation without being forced through a beginner tutorial.

## 3. Technology Stack
The platform is built using a modern, type-safe full-stack architecture tailored to real-time performance and scalability:
- **Frontend & Backend Framework:** Next.js 16 (App Router) with React.js 19.
- **Language:** TypeScript for end-to-end type safety.
- **Styling:** Tailwind CSS (v4) with utility libraries like `clsx` and `tailwind-merge`.
- **Database & Authentication:** Supabase (PostgreSQL) leveraging `@supabase/ssr` and `@supabase/supabase-js`. Utilizing `pgvector` for vector-based AI embeddings and JSONB for flexible component schemas.
- **AI Integration:** Direct integration via the `openai` SDK to handle complex prompt engineering, natural language processing, and text streaming.
- **Data Validation:** Zod for strict schema validation.
- **Testing:** Vitest and `@testing-library/react` for fast, reliable unit and component testing.

## 4. Application Flow
1. **Onboarding & Intent Analysis:** The user is greeted with a minimalist interface. They can choose to engage the AI Assistant (Wizard Mode) or jump straight into the visual configurator (Sandbox Mode).
2. **AI Dialogue (Wizard Mode):** The user describes their ideal keyboard using natural language. The AI interprets this, fetches compatible parts from the Supabase database using Retrieval-Augmented Generation (RAG), and outputs a validated parts list.
3. **Real-Time Visual Assembly:** The user enters the configurator workspace. They select components (Case, PCB, Plate, Switches, Keycaps). The system visually renders the keyboard using layered 2D images.
4. **Compatibility Guardrails:** As parts are selected, the rule engine dynamically filters out incompatible options (e.g., hiding 60% cases if a 65% PCB is selected).
5. **Sensory Verification:** The user can trigger A/B audio comparisons for selected switches to verify the acoustic profile.
6. **Checkout & Social Sharing:** The finalized build generates a Bill of Materials with vendor links. Authenticated users can save the build to their profile or publish it to the Community Gallery for others to view and clone.

## 5. Functional Requirements & Capabilities

### 5.1 Smart AI Assistant
- **Intent Translation:** Convert natural language input into structured database queries.
- **Jargon Buster:** Automatically detect and explain technical terms in a beginner-friendly manner.
- **Context-Aware Recommendations:** Suggest components based on ongoing chat history and previously selected parts.

### 5.2 Interactive Keyboard Builder (Visualizer)
- **Layered 2D Rendering:** Stack high-fidelity component images based on z-index to provide immediate visual feedback.
- **Dynamic Pricing:** Calculate and update the total estimated cost in real-time as parts are swapped.
- **Logic Guard (Compatibility Engine):** Prevent physically incompatible selections (e.g., optical switches on a mechanical PCB, or mismatched layout standards like ANSI/ISO).

### 5.3 Acoustic Library
- **Audio Playback:** Play high-fidelity sound samples for individual switches.
- **A/B Comparison:** Allow side-by-side acoustic comparisons to simulate physical testing and satisfy the user's "Need for Touch" (NFT).

### 5.4 Community Repository
- **Cloud Save:** Persist unfinished and completed configurations to user profiles.
- **Public Gallery:** Publish builds to a community board for social proof.
- **One-Click Clone:** Enable users to duplicate an existing community build into their own workspace as a starting template.

## 6. Non-Functional Requirements

### 6.1 Performance
- **Logic Engine Latency:** Compatibility validation must complete in under 200ms.
- **AI Response Time:** Initial text tokens from the AI assistant must generate within 2 seconds.
- **Image Optimization:** 2D assets must be pre-loaded and cached to ensure instant visual updates without layout shifts.

### 6.2 Reliability & Accuracy
- **Logic Integrity:** The system must guarantee 100% prevention of physically incompatible component pairs.
- **AI Grounding:** The AI must only recommend products that exist in the database (via RAG) to eliminate hallucinated components.

### 6.3 Security
- **Authentication & Authorization:** Secure user sessions via Supabase SSR.
- **Data Protection:** Secure storage of user profiles and saved builds. Server-side API key storage to prevent leakage.

### 6.4 Usability & Accessibility
- **Responsive Design:** Core configurator tailored for desktop power users, with accessible layout adaptations for varying screen sizes.
- **Visual Realism:** Accurate visual layering (e.g., keycaps correctly masking switches and plates).
