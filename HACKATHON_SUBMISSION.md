# MyDoctor Health Assistant - Hackathon Submission Summary

## 🎯 Project Overview
**Name**: MyDoctor Health Assistant | Pembantu Kesihatan MyDoctor  
**Category**: Service/Helpdesk Bot for Healthcare Sector  
**Target**: Government clinics in Malaysia (Klinik Kesihatan)  
**Tech Stack**: Next.js 14 + JamAI Base (4 tables: 1 Knowledge, 2 Action, 1 Chat)

---

## ✅ Completion Checklist

### Backend (JamAI Base)
- [x] Knowledge Table: `health_faqs` (10 health FAQs in EN/MS)
- [x] Action Table: `symptom_classifier` (classify symptoms, detect language, assess urgency)
- [x] Action Table: `appointment_bookings` (store appointments, generate confirmations)
- [x] Chat Table: `health_assistant` (RAG-powered health chatbot)
- [x] Sample data: `health_faqs.jsonl` (ready to upload)
- [x] Setup guide: `TABLE_SETUP.md` (complete with prompts)

### Frontend (Next.js)
- [x] Main chat page (`src/app/page.tsx`)
  - [x] Bilingual UI (EN/MS toggle)
  - [x] Quick action buttons (Check symptoms, Vaccination, Clinic hours)
  - [x] Metadata badges (symptom type, urgency, language)
  - [x] Medical disclaimer
- [x] Appointment booking page (`src/app/appointment/page.tsx`)
  - [x] Form with validation
  - [x] Date picker (min: tomorrow)
  - [x] Time slot selection (morning/afternoon)
  - [x] Success confirmation screen
- [x] API routes
  - [x] `/api/chat` (symptom classification → RAG response)
  - [x] `/api/appointment` (booking submission)

### Documentation
- [x] README.md (comprehensive setup + hackathon alignment)
- [x] TABLE_SETUP.md (detailed table schemas and prompts)
- [x] .env.local.example (updated for health tables)
- [x] .gitignore (excludes secrets and build artifacts)

---

## 🎓 Hackathon Criteria Coverage

### 1. Local Impact & Problem Fit (25%) ⭐⭐⭐⭐⭐
✅ **Problem**: Malaysian clinic patients don't know when to visit vs call 999, face language barriers, struggle with appointment booking  
✅ **Solution**: 24/7 bilingual AI assistant, emergency detection, online booking  
✅ **Target**: Government clinic patients (lower-income, elderly, non-English speakers)

### 2. Use of JamAI Base & AI (25%) ⭐⭐⭐⭐⭐
✅ **4 tables**: Knowledge, 2x Action, Chat  
✅ **Multi-step orchestration**: Classify → RAG → Respond + Appointment storage  
✅ **RAG**: Top K=3, reranking, multilingual embeddings (bge-m3)  
✅ **Prompt engineering**: Language detection, emergency rules, scope limiting

### 3. Creativity & Relevance (20%) ⭐⭐⭐⭐⭐
✅ **Malaysian context**: RM1 consultation, MySejahtera, local contact numbers (999, 03-7956 2424)  
✅ **Smart features**: Urgency color-coding, metadata badges, separate appointment flow  
✅ **Cultural sensitivity**: IC/MyKad requirements, bilingual everything

### 4. User Experience (15%) ⭐⭐⭐⭐⭐
✅ **Simple interface**: Quick actions, plain language, mobile-responsive  
✅ **Accessibility**: Emoji icons, color-coded urgency, bilingual welcome  
✅ **Validation**: Form checks, date restrictions, loading states

### 5. Technical Execution (15%) ⭐⭐⭐⭐⭐
✅ **Working demo**: Chat + appointment booking end-to-end  
✅ **Code quality**: TypeScript, modular API routes, documented  
✅ **Error handling**: API validation, fallback messages

---

## 🚀 Setup Instructions (Quick Start)

### 1. Install
```powershell
cd hackathon\council-complaint-helper
npm install
```

### 2. Setup JamAI Base
- Follow `jamaibase-data/TABLE_SETUP.md`
- Upload `health_faqs.jsonl`
- Create 3 tables (symptom_classifier, appointment_bookings, health_assistant)

### 3. Configure
```powershell
copy .env.local.example .env.local
# Edit .env.local with your JAMAI_API_KEY and JAMAI_PROJECT_ID
```

### 4. Run
```powershell
npm run dev
# Open http://localhost:3000
```

---

## 🎬 Demo Script

### Test 1: English Symptom Query
**Input**: "I have high fever for 3 days"  
**Expected**:
- Badge: `fever` | `high` (orange) | `🇬🇧 EN`
- Response: Advises visit clinic today, includes contact 03-7956 2424
- RAG citation: [@0] from health_faqs

### Test 2: Malay Emergency Query
**Input**: "Saya sakit dada teruk"  
**Expected**:
- Badge: `emergency` | `🚨 emergency` (red) | `🇲🇾 MS`
- Response: Immediately advises call 999, do NOT drive
- Emergency detection triggered

### Test 3: General Question
**Input**: "What vaccinations are available?"  
**Expected**:
- Badge: `general` | `low` (green) | `🇬🇧 EN`
- Response: Lists COVID-19, flu, HPV, hepatitis B with prices
- RAG retrieves vaccination FAQ

### Test 4: Appointment Booking
**Steps**:
1. Click "Book Appointment" button
2. Fill form: Name, Phone, Date (tomorrow), Time (morning), Reason (Vaccination)
3. Submit
**Expected**:
- Success screen with confirmation message
- Reference number: APT-XXXXXX
- "We will contact you within 24 hours"

---

## 📊 Key Metrics

**Features**:
- 10 health FAQs in knowledge base
- 4 JamAI Base tables orchestrated
- 2 pages (Chat + Appointment)
- 2 API routes
- 3 quick action buttons
- 5 urgency levels (emergency, high, medium, low, unknown)
- 2 languages (EN, MS) with auto-detection

**Code Stats**:
- ~270 lines TypeScript (page.tsx)
- ~290 lines TypeScript (appointment/page.tsx)
- ~85 lines TypeScript (api/chat/route.ts)
- ~85 lines TypeScript (api/appointment/route.ts)
- 504 lines Markdown (README.md)
- 300+ lines Markdown (TABLE_SETUP.md)

---

## 🛠️ Tech Stack Details

**Frontend**:
- Next.js 14.2.3 (App Router)
- React 18.3.1
- TypeScript 5
- Tailwind CSS 3.4.1
- Lucide React 0.344.0 (icons)

**Backend**:
- JamAI Base Cloud API (v1 gen_tables)
- LLM: ELLM Qwen/Qwen2.5-32B-Instruct (Qwen3 30B)
- Embedding: ellm/BAAI/bge-m3 (multilingual)

**Deployment Ready**:
- Vercel-compatible (Next.js)
- Environment variables configured
- .gitignore excludes secrets

---

## 🔗 Important Files

### Must-Read for Judges
1. `README.md` - Complete project overview + hackathon alignment
2. `jamaibase-data/TABLE_SETUP.md` - JamAI Base table schemas and prompts
3. `src/app/page.tsx` - Main chat interface
4. `src/app/appointment/page.tsx` - Appointment booking page
5. `src/app/api/chat/route.ts` - Multi-step AI workflow (classify → chat)

### Data Files
1. `jamaibase-data/health_faqs.jsonl` - 10 health FAQs (ready to upload)
2. `.env.local.example` - Environment variable template

---

## 💡 What Makes This Special

### 1. Real Malaysian Context
- Government clinic rates (RM1 consultation)
- Local emergency number (999)
- Actual clinic (Klinik Kesihatan Petaling Jaya)
- Malaysian health programs (free COVID-19 boosters, MySejahtera)

### 2. Safety First
- Emergency detection (chest pain, severe bleeding → call 999)
- Medical disclaimer on every page
- Scope limiting (no diagnosis, only guidance)
- Proper triage (emergency vs urgent vs routine)

### 3. Sophisticated AI
- Not just a single LLM call - multi-table orchestration
- RAG prevents hallucination (grounded in knowledge base)
- Language detection from user input (not just UI toggle)
- Metadata enrichment (symptom type, urgency, language)

### 4. Production-Ready Architecture
- Separate pages for different user intents (chat vs booking)
- Error handling and validation
- Loading states and animations
- Mobile-responsive design
- Scalable (can add more clinics, FAQs, languages)

---

## 🎯 Alignment with Hackathon Requirements

**Industry Context**: Healthcare sector ✅  
**Problem**: SMEs/clinics struggle with manual appointment systems ✅  
**Solution**: AI-powered chatbot + booking system ✅  
**JamAI Base Usage**: 4 tables with multi-step orchestration ✅  
**Multilingual**: EN + BM with auto-detection ✅  
**RAG**: Knowledge base with embeddings ✅  
**Local Data**: Malaysian clinic FAQs, contact numbers ✅  
**Simple Interface**: Non-technical users can use it ✅

---

## 🚀 Next Steps (Post-Hackathon)

### Immediate (Week 1)
- [ ] Test with real clinic staff for feedback
- [ ] Add 10 more FAQs (medication refills, health screening, women's health)
- [ ] SMS confirmation integration (Twilio/local SMS gateway)

### Short-term (Month 1)
- [ ] Expand to 5 clinics (MBPJ, DBKL, Klinik 1Malaysia)
- [ ] Admin dashboard (view bookings, common symptoms)
- [ ] Photo upload for symptom documentation

### Long-term (Quarter 1)
- [ ] Integration with actual clinic appointment systems
- [ ] Doctor availability calendars
- [ ] Telemedicine video consultation
- [ ] Health records portal

---

## 📞 Contact

**For Questions**: [Your contact info]  
**Demo Video**: [YouTube/Loom link if available]  
**Live Demo**: [Vercel deployment URL if deployed]  
**GitHub**: [Repository link]

---

**Built with ❤️ for Malaysian healthcare accessibility**
