# Demo Video and Slides

Demonstration video: https://drive.google.com/file/d/1Pd_tTVpRWKLYPhgZju9oH8L8RhczQ3sD/view?usp=sharing \
Slides: [Script Diddies PeKom Code Fest Hackathon Presentation](<Script Diddies PeKom Code Fest Hackathon Presentation.pdf>)

---
# Kliniku

A bilingual (English/Bahasa Malaysia) health chatbot and appointment booking system for Malaysian government clinics, powered by JamAI Base.

**EmbeddedLLM Track**: Generative AI for Malaysian Industries with JamAI Base  
**TEAM NAME**: Script Diddies \
**Members**: Daniel Vivian Menezes, Muhaimin Afif Bin Mushahar, Yim Zi Hao, Ammar Kapadia, Ilham Narendra Setiabudi

---

## Setup & Run (Developer Guide)

Follow these steps to run the project locally and connect it to JamAI Base.

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- A JamAI Base account with an API key and a the imported project from [Kliniku_base_tables](jamaibase-data/Kliniku_base_tables.parquet)

### Repository

Clone the repo and install dependencies:

```powershell
git clone <repo-url>
cd Kliniku-health-assistant
npm install
```

### JamAIBase Table Setup
To start testing the program immediately, import the [example table](jamaibase-data/Kliniku_base_tables.parquet) into JamAI Base

### Environment Variables

Create a `.env.local` file in the project root and set the following values (example keys shown):

```text
JAMAI_API_KEY=sk-<your_jamai_api_key>
JAMAI_BASE_URL=https://api.jamaibase.com
JAMAI_PROJECT_ID=<optional_project_id>
```

### Running Locally

- Start development server:

```powershell
npm run dev
```

Open `http://localhost:3000` in your browser. The app uses Next.js App Router with server-side environment variables for JamAI API calls.

### Demo Admin Credentials

The project includes local demo credentials for admin and staff (stored in `data/admin-credentials.json`).

- Admin: `admin` / `Kliniku`
- Staff: `staff` / `Staff@123`

Change these in `data/admin-credentials.json` if you need different demo logins.