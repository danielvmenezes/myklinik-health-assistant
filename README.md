# MyDoctor Health Assistant | Pembantu Kesihatan MyDoctor

A bilingual (English/Bahasa Malaysia) health chatbot and appointment booking system for Malaysian government clinics, powered by JamAI Base.

**Hackathon**: Generative AI for Malaysian Industries with JamAI Base  
**Use Case**: Service/helpdesk bot for clinic (healthcare sector)

## 🎯 Problem Statement

Many Malaysian clinic patients struggle with:
- Understanding when to visit a clinic vs calling emergency services (999)
- Getting accurate health information in their preferred language (EN/BM)
- Knowing what services are available and their costs
- Booking appointments without long phone waits
- Navigating government clinic procedures (operating hours, required documents, etc.)

## 💡 Solution

An AI-powered health assistant for **Klinik Kesihatan Petaling Jaya** that:
- Answers health questions using RAG from a knowledge base of clinic FAQs
- Classifies symptoms and assesses urgency levels (emergency/high/medium/low)
- Provides bilingual support (English & Bahasa Malaysia) with automatic language detection
- Enables online appointment booking with confirmation messages
- Guides patients on when to call 999 vs visiting the clinic
- Uses JamAI Base's multi-table orchestration (Knowledge, Action, Chat tables)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: JamAI Base (Knowledge, Action, Chat tables)
- **LLM**: ELLM Qwen3 (30B-A3B) for bilingual support
- **Embedding**: BAAI/bge-m3 (multilingual) for RAG
- **UI Components**: Lucide React icons

### JamAI Base Integration (4 Tables)

#### 1. Knowledge Table: `health_faqs`
Stores 10 health FAQs covering common symptoms, clinic services, vaccination, emergency guidance
```
Columns:
- category (Text): general, services, symptoms_fever, symptoms_cough, emergency, etc.
- question_en (Text): Question in English
- question_ms (Text): Question in Bahasa Malaysia
- answer_en (Text): Detailed answer in English
- answer_ms (Text): Detailed answer in Bahasa Malaysia
- keywords (Text): Search terms for RAG retrieval
```

**Sample Categories**:
- Clinic hours, services, location, costs
- Symptoms (fever, cough, rash)
- Emergency (when to call 999)
- Vaccination info and prices

#### 2. Action Table: `symptom_classifier`
Classifies user health queries and determines urgency
```
Input: user_message
Output: 
  - symptom_category (fever, cough, rash, pain, respiratory, emergency, etc.)
  - urgency_level (emergency, high, medium, low)
  - language_detected (en, ms)
```

**Use Case**: Enables metadata badges showing symptom type and urgency color-coding (🚨 red for emergency, ⚠️ orange for high, yellow for medium, green for low)

#### 3. Action Table: `appointment_bookings`
Stores appointment requests submitted by patients
```
Input:
  - patient_name
  - phone_number
  - preferred_date
  - preferred_time (morning/afternoon)
  - reason (e.g., "fever and cough", "vaccination")

Output:
  - confirmation_message_en (LLM-generated confirmation in English with reference number)
  - confirmation_message_ms (LLM-generated confirmation in Malay with reference number)
```

**Use Case**: Transactional data storage + automatic confirmation generation

#### 4. Chat Table: `health_assistant`
Main conversational interface with RAG from `health_faqs` knowledge base
```
Input: User (Text)
Output: AI (LLM-generated)

System Prompt:
- Detect language from user's message (EN/MS) and respond in same language
- Retrieve relevant health information from knowledge base
- Assess urgency and provide appropriate guidance
- For emergencies (chest pain, severe bleeding, difficulty breathing) → immediately advise calling 999
- For urgent symptoms (high fever >39°C, symptoms >3 days) → advise visit clinic today
- For moderate symptoms → suggest booking appointment within 2-3 days
- Include clinic contact (03-7956 2424) when relevant
- Use plain text formatting with emoji icons (no markdown bold)
- Stay within scope of clinic services

RAG Configuration:
- Knowledge Table: health_faqs
- Top K: 3 (retrieve 3 most relevant documents)
- Reranking: Enabled
```

**Multi-Step AI Workflow**:
1. User message → `symptom_classifier` Action Table (classify + detect language)
2. Classification metadata → `health_assistant` Chat Table with language instruction
3. Chat Table performs RAG lookup on `health_faqs` Knowledge Table
4. LLM generates contextual response with citations ([@0] references)
5. Frontend displays response + metadata badges (symptom type, urgency, language)

## 🚀 Getting Started

### 1. Install Dependencies
```powershell
cd hackathon\council-complaint-helper
npm install
```

### 2. Set Up JamAI Base Tables

**Important**: Follow `jamaibase-data/TABLE_SETUP.md` for detailed instructions.

#### Quick Setup:
1. Go to [JamAI Base Cloud](https://cloud.jamaibase.com/)
2. Create **Knowledge Table** `health_faqs`:
   - Upload `jamaibase-data/health_faqs.jsonl` (10 rows)
   - Set embedding model: `ellm/BAAI/bge-m3`
3. Create **Action Table** `symptom_classifier`:
   - Input: `user_message`
   - Outputs: `symptom_category`, `urgency_level`, `language_detected` (all LLM columns)
   - Copy prompts from `TABLE_SETUP.md`
4. Create **Action Table** `appointment_bookings`:
   - Inputs: `patient_name`, `phone_number`, `preferred_date`, `preferred_time`, `reason`
   - Outputs: `confirmation_message_en`, `confirmation_message_ms` (LLM columns)
5. Create **Chat Table** `health_assistant`:
   - Input: `User`
   - Output: `AI` (LLM)
   - Enable RAG with `health_faqs` knowledge table
   - Copy system prompt from `TABLE_SETUP.md`

### 3. Configure Environment Variables
```powershell
copy .env.local.example .env.local
```

Edit `.env.local`:
```env
JAMAI_API_KEY=your_api_key_here
JAMAI_PROJECT_ID=your_project_id_here
JAMAI_BASE_URL=https://api.jamaibase.com

KNOWLEDGE_TABLE_ID=health_faqs
ACTION_TABLE_SYMPTOM=symptom_classifier
ACTION_TABLE_APPOINTMENT=appointment_bookings
CHAT_TABLE_ID=health_assistant
```

### 4. Run Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

### Current Implementation
- ✅ Bilingual health chatbot (EN/BM with automatic language detection)
- ✅ Symptom classification with urgency assessment
- ✅ RAG-powered responses from health FAQ knowledge base
- ✅ Emergency detection (advises calling 999 for life-threatening symptoms)
- ✅ Online appointment booking system
- ✅ Multi-table JamAI Base orchestration (4 tables)
- ✅ Metadata badges (symptom category, urgency level, language detected)
- ✅ Medical disclaimer at bottom of page
- ✅ Quick action buttons (Check symptoms, Vaccination info, Clinic hours)
- ✅ Separate appointment booking page with form validation

### Demo Scenarios
1. **English Symptom Query**: "I have high fever for 3 days"
   - Expected: Classifies as "fever" | "high" urgency | Advises visit clinic today
2. **Malay Emergency Query**: "Saya sakit dada teruk"
   - Expected: Classifies as "emergency" | 🚨 badge | Immediately advises call 999
3. **General Question**: "What are the clinic operating hours?"
   - Expected: RAG retrieves hours FAQ | Responds with Mon-Fri, 8 AM - 5 PM
4. **Appointment Booking**: Fill form → Submit
   - Expected: Confirmation message with reference number (APT-XXXXXX)
```

### 2. Set Up Environment Variables
```powershell
copy .env.local.example .env.local
```

Edit `.env.local` with your JamAI Base credentials:
```env
JAMAI_API_KEY=your_api_key_here
JAMAI_PROJECT_ID=your_project_id_here
JAMAI_BASE_URL=https://api.jamaibase.com
```

### 3. Initialize JamAI Base Tables
```powershell
npm run setup-tables
```
(This script will create Knowledge/Action/Chat tables with sample data)

### 4. Run Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

### Current Implementation
- ✅ Bilingual UI (English/Malay toggle)
- ✅ Chat interface with message history
- ✅ Quick action buttons for common issues
- ✅ Issue classification logic
- ✅ Structured response with contact numbers
- ✅ Mobile-responsive design

### With JamAI Base (Next Steps)
- 🔄 RAG from Knowledge table for accurate procedures
- 🔄 Action table for intelligent classification
- 🔄 Chat table for context-aware conversations
- 🔄 Logging user queries to improve responses
- 🔄 Multi-council support (dynamic based on location)

## 🎓 Hackathon Judging Criteria Alignment

### 1. Local Impact & Problem Fit (25%)
✅ **Problem**: Malaysian clinic patients struggle with:
- Knowing when to visit clinic vs call 999 (emergency vs routine)
- Language barriers (many prefer BM but medical info often in English only)
- Long phone wait times for appointment booking
- Lack of accessible health information outside clinic hours

✅ **Solution**: 
- Government clinic focus (Klinik Kesihatan Petaling Jaya)
- Bilingual AI assistant available 24/7
- Emergency detection (advises 999 for chest pain, severe bleeding, stroke symptoms)
- Online appointment booking reduces phone congestion

✅ **Target Users**: 
- Patients at government clinics (lower-income Malaysians)
- Non-English speakers (elderly, rural populations)
- First-time clinic visitors unfamiliar with procedures

### 2. Use of JamAI Base & AI (25%)
✅ **Multi-table orchestration** (not just single API call):
- **Step 1**: User message → `symptom_classifier` Action Table (classify symptom, detect language, assess urgency)
- **Step 2**: Classification metadata → `health_assistant` Chat Table with explicit language instruction
- **Step 3**: Chat Table performs RAG on `health_faqs` Knowledge Table (Top K=3, reranking enabled)
- **Step 4**: LLM generates contextual response with citations ([@0] references to knowledge base)
- **Step 5**: Appointment booking → `appointment_bookings` Action Table (transactional storage + confirmation generation)

✅ **RAG (Retrieval-Augmented Generation)**:
- Knowledge base: 10 health FAQs (symptoms, services, costs, emergencies)
- Multilingual embeddings: `ellm/BAAI/bge-m3`
- Prevents hallucination by grounding responses in actual clinic data

✅ **Prompt design**:
- Explicit language detection rules in Action Table
- Emergency detection logic in Chat Table system prompt
- Scope limiting (clinic services only, no medical diagnosis)

✅ **Multilingual support**:
- Automatic language detection from user input
- Parallel EN/MS content in knowledge base
- LLM instructed to match user's language

### 3. Creativity & Relevance (20%)
✅ **Fresh adaptation for Malaysian context**:
- Government clinic focus (RM1 consultation rates, MySejahtera references)
- Local contact numbers (999, Klinik Kesihatan PJ: 03-7956 2424)
- Malaysian health landscape (free COVID-19 boosters, HPV vaccine pricing)
- Cultural sensitivity (IC/MyKad requirements, multilingual support)

✅ **Smart features**:
- Urgency color-coding: 🚨 red (emergency), ⚠️ orange (high), yellow (medium), green (low)
- Metadata badges showing symptom type, urgency, language detected
- Medical disclaimer compliance
- Separate appointment booking flow (not mixed with chat)

### 4. User Experience (15%)
✅ **Simple interface for non-technical users**:
- Quick action buttons (Check symptoms, Vaccination info, Clinic hours)
- Plain language (no medical jargon unless necessary)
- Language toggle (EN ↔ BM) prominently displayed
- Mobile-responsive design (most Malaysians access via phone)
- Loading states with animations
- Clear timestamps on messages

✅ **Accessibility**:
- Emoji icons for visual hierarchy (📞, ⏱️, 💡)
- Color-coded urgency levels (red/orange/yellow/green)
- Bilingual welcome message
- Medical disclaimer at bottom of every page

### 5. Technical Execution (15%)
✅ **End-to-end working demo**:
- Next.js frontend (TypeScript, Tailwind CSS)
- JamAI Base REST API integration (v1 gen_tables)
- Proper error handling and validation
- Environment variable configuration
- Two functional pages: Chat + Appointment Booking

✅ **Code quality**:
- TypeScript for type safety
- Modular API routes (`/api/chat`, `/api/appointment`)
- Clean separation: UI components, API logic, env config
- Documented setup instructions (`TABLE_SETUP.md`, `README.md`)

---

## 🚀 Future Enhancements

### Phase 2 (Post-Hackathon)
- **Multi-clinic support**: Expand to MBPJ, DBKL, Klinik 1Malaysia
- **SMS notifications**: Send appointment confirmations via SMS
- **Admin dashboard**: View booking analytics, common symptoms, language distribution
- **Photo upload**: Allow patients to upload symptom photos (rash, wound, etc.)
- **Queue management**: Real-time waiting time estimates
- **MySejahtera integration**: Pull vaccination records

### Phase 3 (Production)
- **Real DBMS integration**: Connect to actual clinic appointment system
- **Doctor availability**: Show real-time slot availability
- **Prescription refill**: Request repeat prescriptions via chatbot
- **Health records**: Secure patient portal for viewing test results
- **Telemedicine**: Video consultation for minor ailments

---

## 📊 Impact Metrics

**Target KPIs**:
- Reduce phone call volume to clinic by 40%
- 80% patient satisfaction with appointment booking
- 50% queries resolved without clinic visit (self-care guidance)
- <2 second average response time
- Support for 10,000+ patients per month

**Cost Savings**:
- Clinic staff time: ~RM 5,000/month (less phone answering)
- Patient time: ~30 min per visit saved (pre-visit info, reduced wait times)
- Emergency services: Proper triage reduces ambulance callouts

---

## 🛠️ Technical Details

### API Endpoints

**Chat**: `POST /api/chat`
```json
Request: { "message": "I have fever", "language": "en" }
Response: { 
  "response": "AI response text",
  "metadata": {
    "symptomCategory": "fever",
    "urgency": "medium",
    "language": "en"
  }
}
```

**Appointment**: `POST /api/appointment`
```json
Request: {
  "patientName": "Ahmad bin Ali",
  "phoneNumber": "0123456789",
  "preferredDate": "2025-11-27",
  "preferredTime": "morning",
  "reason": "Vaccination",
  "language": "ms"
}
Response: {
  "success": true,
  "confirmation": "Permohonan temujanji anda telah diterima..."
}
```

### JamAI Base Table IDs
- Knowledge: `health_faqs`
- Action (Classification): `symptom_classifier`
- Action (Appointments): `appointment_bookings`
- Chat: `health_assistant`

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

Built for **Generative AI for Malaysian Industries with JamAI Base** hackathon

**Contact**: [Your contact info]

---

## 📚 Resources

- [JamAI Base Documentation](https://docs.jamaibase.com/)
- [JamAI Base Cloud](https://cloud.jamaibase.com/)
- [Table Setup Guide](./jamaibase-data/TABLE_SETUP.md)
- [Health FAQs Data](./jamaibase-data/health_faqs.jsonl)
- ✅ Novel application: civic tech for Malaysia
- ✅ Practical adaptation of RAG for public service
- ✅ Addresses digital divide (simple UI, bilingual)

### 4. User Experience (15%)
- ✅ WhatsApp-like familiar interface
- ✅ Quick action buttons for non-technical users
- ✅ Clear step-by-step guidance
- ✅ Mobile-first responsive design

### 5. Technical Execution (15%)
- ✅ Full-stack Next.js application
- ✅ API routes for backend logic
- ✅ TypeScript for type safety
- ✅ Ready for JamAI Base integration


## 📱 Screenshots

(Add screenshots here after running)

## 🤝 Contributing

This is a hackathon prototype. To improve:
1. Connect real JamAI Base tables
2. Add location detection (GPS / address input)
3. Add photo upload for evidence
4. Implement reference number tracking
5. Add follow-up reminder system

## 📄 License

MIT License - see LICENSE file

## 🏆 Hackathon Team

Built for: **Generative AI for Malaysian Industries with JamAI Base**
Focus: Civic Tech / Public Service Innovation

---

**Live Demo**: (Add deployment URL)
**Video Demo**: (Add video link)

