# AI Review Assistant

AI-powered Google Business Profile review assistant that helps customers turn their **genuine feedback** into natural, editable review drafts.

> Built as a portfolio project to demonstrate practical skills in digital marketing, Google Business Profile workflows, AI integration, web development, authentication, and product thinking.

## 🚀 Live Demo

**Live app:** https://google-review-ai-lac.vercel.app/

**GitHub:** https://github.com/kashish-dig/google-review-ai

## 🎯 The Problem

Businesses often make it easy for customers to leave feedback, but customers may struggle to turn what they actually experienced into a clear review.

This project explores a simple workflow:

**Customer scans QR → shares experience → AI creates editable drafts → customer chooses/edits a draft → customer continues to Google Reviews.**

The goal is to reduce friction while keeping the customer's own experience and words at the center.

## ✨ Key Features

- **Website analysis** — extracts supported business information from a public website.
- **Business profiles** — saves business information to the owner's account.
- **Owner authentication** — login, signup, logout, and password recovery.
- **QR customer flow** — creates a business-specific customer experience URL.
- **Rating collection** — accessible 1–5 star interaction with keyboard support.
- **Service selection** — adapts service options to the analyzed business.
- **Genuine feedback input** — customers describe what actually happened during their experience.
- **AI review drafts** — generates three editable versions from customer-provided information.
- **Copy-to-clipboard** — makes it easy for customers to use the draft wherever they choose.
- **Google Review handoff** — sends the customer to the business's configured Google review link.
- **Responsive UI** — designed for both desktop and mobile use.
- **Loading and error states** — includes QR loading, analysis, and unavailable-page states.

## 🔄 Complete Customer Journey

### 1. Business owner signs in

The owner creates an account and accesses the business setup screen.

### 2. Business website is analyzed

The owner enters the public business website. AI extracts supported information such as:

- Business name
- Industry
- Location
- Main services

The information is saved to the owner's business profile.

### 3. Business creates a QR experience

The app generates a business-specific QR code that opens the customer experience for that business.

### 4. Customer scans the QR code

The customer sees a focused experience page without the owner's account controls.

### 5. Customer shares their experience

The customer selects:

- Their rating
- The service they used
- Their genuine experience in their own words

### 6. AI creates review drafts

The AI uses the customer's supplied information to create three versions:

- **Natural** — conversational and relaxed
- **Professional** — polished but still like a real customer
- **Short & Simple** — concise and easy to read

Each draft is editable before the customer decides what to do next.

### 7. Customer continues to Google Reviews

The customer can copy or edit a draft and continue to the business's Google review page.

## 🤖 AI Safety & Authenticity

This project is intentionally designed as a **review-writing assistant, not a fake-review generator**.

The AI is instructed to:

- Use only facts supplied by the customer.
- Never invent staff names, prices, results, benefits, locations, emotions, or outcomes.
- Preserve the customer's actual meaning.
- Avoid marketing copy and artificial SEO language.
- Keep the generated drafts editable.
- Never fabricate a customer experience.

The customer remains responsible for the final review they choose to publish.

## 🛠️ Technology

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Vercel serverless API routes
- **AI:** Groq API
- **AI model:** `openai/gpt-oss-20b` for website analysis and review drafting
- **Database:** Supabase
- **Authentication:** Supabase Auth
- **Hosting:** Vercel
- **Repository:** GitHub
- **QR generation:** QRCode.js

## 🏗️ High-Level Architecture

```text
                    ┌──────────────────────┐
                    │    Business Owner    │
                    └──────────┬───────────┘
                               │
                         Website URL
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Vercel API Route   │
                    │   /api/analyze       │
                    └──────────┬───────────┘
                               │
                         Website content
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Groq AI         │
                    │ Business extraction  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Supabase       │
                    │ Business + Auth data │
                    └──────────┬───────────┘
                               │
                         Business QR
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Customer       │
                    │ Rating + Experience │
                    └──────────┬───────────┘
                               │
                         Genuine feedback
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Groq AI         │
                    │   Review drafts      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Customer edits/copies│
                    │   and Google Review  │
                    └──────────────────────┘
```

## 📁 Project Structure

```text
.
├── index.html
├── api/
│   ├── analyze.mjs
│   ├── auth-config.js
│   ├── business.js
│   ├── generate-review.js
│   ├── my-business.js
│   └── my-business-update.js
└── README.md
```

## 🔐 Environment Variables

The application uses server-side environment variables for sensitive credentials.

```text
GROQ_API_KEY
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_PUBLISHABLE_KEY
```

Sensitive API keys are not exposed in the frontend.

## 💡 Why I Built This

I wanted to take a real digital-marketing problem — making it easier for customers to share genuine Google Business Profile feedback — and turn the idea into a working product rather than only describing it.

The project helped me work across:

- Google Business Profile concepts
- Customer journey design
- AI prompt engineering
- API integration
- Authentication
- Database design
- QR-based experiences
- Frontend UX
- Deployment
- Debugging and testing

## 📌 Project Status

**MVP complete and deployed.**

The core owner and customer journeys have been implemented and tested end-to-end.

Future improvements could include analytics, stronger business-profile management, richer review-draft controls, and additional accessibility refinements.

## ⚠️ Disclaimer

This is an independent portfolio project and is not affiliated with or endorsed by Google.
