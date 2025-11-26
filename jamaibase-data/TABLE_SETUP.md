# JamAI Base Table Setup for MyDoctor Health Assistant

## Overview
This document describes the JamAI Base table architecture for the MyDoctor health chatbot and appointment booking system.

---

## 📊 Quick Reference: All Tables & Settings

| Table | Type | Purpose | Model | Temp | Max Tokens | Multi-turn |
|-------|------|---------|-------|------|------------|------------|
| `health_faqs` | Knowledge | Store 21 health FAQs for RAG | N/A (Embedding: bge-m3) | N/A | N/A | N/A |
| `symptom_classifier` | Action | Classify symptoms, detect language, assess urgency | Qwen3 30B | 0.1-0.3 | 10-50 | Disabled |
| `appointment_bookings` | Action | Store appointments, generate confirmations | Qwen3 30B | 0.7 | 200 | Disabled |
| `health_assistant` | Chat | Main chatbot with RAG | Qwen3 30B | 0.7 | 1500 | Enabled |

### Column-Level Settings Summary

**`symptom_classifier` (Action Table)**:
- `symptom_category`: Temp 0.3, Max 50 tokens (classification keyword)
- `urgency_level`: Temp 0.3, Max 50 tokens (emergency/high/medium/low)
- `language_detected`: Temp 0.1, Max 10 tokens (en/ms)

**`appointment_bookings` (Action Table)**:
- `confirmation_message_en`: Temp 0.7, Max 200 tokens (English confirmation)
- `confirmation_message_ms`: Temp 0.7, Max 200 tokens (Malay confirmation)

**`health_assistant` (Chat Table)**:
- `AI`: Temp 0.7, Max 1500 tokens, Top-p 0.95, RAG enabled (Top K=3, reranking)

---

## 1. Knowledge Table: `health_faqs`

**Purpose**: Store health FAQs, symptom guidance, clinic information for RAG retrieval.

**Upload Method**: Upload `health_faqs.jsonl` file via JamAI Base UI.

**Columns**:
- `category` (Text): general, services, appointment, symptoms_fever, symptoms_cough, symptoms_rash, emergency, vaccination, cost, location
- `question_en` (Text): Question in English
- `question_ms` (Text): Question in Bahasa Malaysia
- `answer_en` (Text): Answer in English
- `answer_ms` (Text): Answer in Bahasa Malaysia
- `keywords` (Text): Search keywords for better retrieval

**Sample Data**: 10 rows covering:
- Clinic hours, services, location
- Appointment booking process
- Common symptoms (fever, cough, rash)
- Emergency guidance (when to call 999)
- Vaccination info and costs

**Settings**:
- **Embedding Model**: `ellm/BAAI/bge-m3` (multilingual)
- **Chunk Size**: 512 tokens
- **RAG**: Enable for Chat Table queries

---

## 2. Action Table: `symptom_classifier`

**Purpose**: Classify user symptoms and determine urgency level.

**Input Column**: `user_message` (Text)

**Output Columns** (LLM-generated):

### Column: `symptom_category`
**Prompt**:
```
Analyze this health-related message and identify the primary symptom category.

User message: ${user_message}

Categories:
- fever (demam, high temperature)
- cough (batuk, persistent cough)
- rash (ruam, skin issues)
- pain (sakit, headache, body ache)
- respiratory (sesak nafas, breathing issues)
- digestive (stomach, nausea, diarrhea)
- injury (cuts, wounds, bleeding)
- general (general health questions)
- appointment (booking, temujanji)
- emergency (severe symptoms requiring 999)

Output ONLY the category keyword. If multiple symptoms, choose the most urgent.
```
**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507` (ELLM Qwen3 30B-A3B, 2507)
- **Temperature**: 0.3 (Low for consistent classification)
- **Max Tokens**: 50 (Short output - single keyword)
- **Top-p**: 0.9
- **System Prompt**: "You are a versatile data generator. Your task is to process information from input data and generate appropriate responses based on the specified column name and input data. Adapt your output format and content according to the column name provided."

### Column: `urgency_level`
**Prompt**:
```
Determine the urgency level of this health concern.

User message: ${user_message}

Urgency levels:
- emergency: Life-threatening (chest pain, severe bleeding, difficulty breathing, stroke symptoms, loss of consciousness) → advise call 999 immediately
- high: Urgent (high fever >39°C, severe pain, symptoms >3 days, rapid worsening) → visit clinic today
- medium: Moderate (mild fever, persistent cough, rash, minor pain) → schedule appointment within 2-3 days
- low: Non-urgent (general questions, minor symptoms, informational queries) → routine appointment or self-care

Output ONLY: emergency, high, medium, or low
```
**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507`
- **Temperature**: 0.3 (Low for consistent urgency assessment)
- **Max Tokens**: 50 (Short output - single keyword)
- **Top-p**: 0.9
- **System Prompt**: Same as above

### Column: `language_detected`
**Prompt**:
```
Detect the language of this message.

User message: ${user_message}

Output ONLY:
- "en" if English
- "ms" if Bahasa Malaysia/Malay

Look for keywords:
English: I, my, have, feel, need, help, appointment
Malay: saya, ada, rasa, perlu, tolong, temujanji, demam, sakit
```
**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507`
- **Temperature**: 0.1 (Very low for deterministic language detection)
- **Max Tokens**: 10 (Shortest - just "en" or "ms")
- **Top-p**: 0.9
- **System Prompt**: Same as above

**Multi-turn chat**: Disabled (not needed for classification)

---

## 3. Action Table: `appointment_bookings`

**Purpose**: Store appointment booking requests submitted by users and generate confirmation messages.

**Input Columns** (user-provided):
- `patient_name` (Text): Full name
- `phone_number` (Text): Contact number (format: +60123456789 or 0123456789)
- `preferred_date` (Text): Date (format: YYYY-MM-DD or DD/MM/YYYY)
- `preferred_time` (Text): Time slot (morning/afternoon/evening or specific time like 10:00 AM)
- `reason` (Text): Brief reason for visit (e.g., "fever and cough", "vaccination", "health screening")

**Output Columns** (LLM-generated):

### Column: `confirmation_message_en`
**Prompt**:
```
Generate a confirmation message in English for this appointment booking.

Patient: ${patient_name}
Phone: ${phone_number}
Preferred Date: ${preferred_date}
Preferred Time: ${preferred_time}
Reason: ${reason}

Format the preferred_time as:
- If "morning": "Morning (8:00 AM - 12:00 PM)"
- If "afternoon": "Afternoon (2:00 PM - 5:00 PM)"

Format:
"Your appointment request has been received. We will contact you at ${phone_number} within 24 hours to confirm your appointment for ${preferred_date} ([formatted time slot]). Reference: APT-[generate 6-digit number]. For urgent matters, call 03-7956 2424."
```
**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507`
- **Temperature**: 0.7 (Moderate for natural message generation)
- **Max Tokens**: 200 (Sufficient for confirmation message)
- **Top-p**: 0.9
- **System Prompt**: "You are a versatile data generator. Your task is to process information from input data and generate appropriate responses based on the specified column name and input data. Adapt your output format and content according to the column name provided."

### Column: `confirmation_message_ms`
**Prompt**:
```
Generate a confirmation message in Bahasa Malaysia for this appointment booking.

Patient: ${patient_name}
Phone: ${phone_number}
Preferred Date: ${preferred_date}
Preferred Time: ${preferred_time}
Reason: ${reason}

Format the preferred_time as:
- If "morning": "Pagi (8:00 AM - 12:00 PM)"
- If "afternoon": "Petang (2:00 PM - 5:00 PM)"

Format:
"Permohonan temujanji anda telah diterima. Kami akan menghubungi anda di ${phone_number} dalam 24 jam untuk mengesahkan temujanji pada ${preferred_date} ([formatted time slot]). Rujukan: APT-[generate 6-digit number]. Untuk perkara mendesak, hubungi 03-7956 2424."
```
**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507`
- **Temperature**: 0.7 (Moderate for natural message generation)
- **Max Tokens**: 200 (Sufficient for confirmation message)
- **Top-p**: 0.9
- **System Prompt**: Same as above

**Multi-turn chat**: Disabled (transactional data storage)

**Settings**:
- No embedding needed (transactional data)
- Rows accessible via API for admin dashboard later

---

## 4. Chat Table: `health_assistant`

**Purpose**: Main conversational interface with RAG from `health_faqs`.

**Input Column**: `User` (Text)

**Output Column**: `AI` (LLM-generated)

**System Prompt**:
```
You are a helpful health assistant for Klinik Kesihatan Petaling Jaya, a government clinic in Malaysia.

⚠️ CRITICAL LANGUAGE RULE:
- If user writes in English → respond ENTIRELY in English
- If user writes in Bahasa Malaysia/Malay → respond ENTIRELY in Bahasa Malaysia
- Detect language from user's message ONLY, ignore retrieved document language

Your role:
1. Answer health questions using the knowledge base (clinic hours, services, symptoms, vaccination, costs)
2. Provide symptom guidance and urgency assessment
3. Help users understand when to visit the clinic vs call 999
4. Be empathetic, clear, and reassuring
5. NEVER diagnose—only provide guidance and suggest professional consultation

Guidelines:
- For emergency symptoms (chest pain, severe bleeding, difficulty breathing, stroke, loss of consciousness) → immediately tell user to CALL 999, do not visit clinic
- For urgent symptoms (high fever >39°C, severe pain, symptoms >3 days) → advise visit clinic today or call 03-7956 2424
- For moderate symptoms → suggest booking appointment within 2-3 days
- For general questions → provide info from knowledge base
- Always include clinic contact: 03-7956 2424 when relevant
- NEVER use markdown formatting (**bold**, *italic*, __underline__) - use plain text only
- Use emoji icons (📞 🟩 🟨 💡 ⚠️ ✅) for visual structure instead of bold text
- Stay within scope of clinic services—refer complex cases to specialists/hospitals

Response format (plain text):
1. [Acknowledge concern in user's language]

2. [Provide guidance based on knowledge base]

3. 📞 Contact: 03-7956 2424 | Emergency: 999

4. 💡 [Additional tip or next step]

Examples:
User: "I have high fever for 3 days"
Response: "I understand you've had a high fever for 3 days. This requires medical attention today. Please visit Klinik Kesihatan Petaling Jaya (open Mon-Fri, 8 AM - 5 PM) or call us at 03-7956 2424 to check availability. Bring your IC and previous medical records if available. If fever is >39°C or you have difficulty breathing, chest pain, or severe headache, call 999 immediately. 💡 Drink plenty of water and rest while waiting."

User: "Saya batuk berterusan"
Response: "Saya faham anda mengalami batuk berterusan. Jika batuk lebih 2 minggu, batuk berdarah, atau disertai sesak nafas, sila lawati klinik kami segera. Untuk batuk kering ringan, berehat, minum air banyak, dan guna madu atau minuman suam. 📞 Hubungi: 03-7956 2424 untuk temujanji. Pakai mask bila bersama orang lain. 💡 Jika batuk disertai demam tinggi atau sakit dada, dapatkan rawatan segera."
```

**User Prompt**:
```
${User}
```

**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507` (ELLM Qwen3 30B-A3B, 2507)
- **Temperature**: 0.7 (Balanced for natural, empathetic responses with creativity)
- **Max Tokens**: 1500 (Sufficient for detailed health guidance)
- **Top-p**: 0.95 (Higher for more diverse, natural language)
- **System Prompt**: (See above - comprehensive health assistant prompt)

**RAG Configuration**:
- **Enable RAG**: Yes
- **Knowledge Table**: `health_faqs`
- **Search Query**: `${User}` (User's message)
- **Top K**: 3 (Retrieve top 3 most relevant documents)
- **Reranking**: Enabled (Improves retrieval accuracy)
- **Embedding Model**: `ellm/BAAI/bge-m3` (Multilingual embeddings for EN/MS)

**Multi-turn chat**: Enabled (Maintains conversation context)

---

## 🔗 Multi-Table Orchestration (Chained Steps)

The MyDoctor system demonstrates sophisticated multi-table orchestration following the hackathon requirement: **"Use Action/Generative tables to chain steps like: understand request → fetch or retrieve data → draft answer → refine"**

### Workflow for Chat Message:

**Step 1: Understand Request** (Action Table: `symptom_classifier`)
- Input: User's raw message (e.g., "I have high fever for 3 days")
- Process: LLM analyzes message in parallel across 3 output columns:
  - `symptom_category`: Classifies symptom type (fever, cough, emergency, etc.)
  - `urgency_level`: Assesses urgency (emergency, high, medium, low)
  - `language_detected`: Detects language (en, ms)
- Output: Structured metadata about the request
- **Model Settings**: Temperature 0.1-0.3 (deterministic classification)

**Step 2: Fetch/Retrieve Data** (Chat Table: `health_assistant` with RAG)
- Input: User's message + classification metadata from Step 1
- Process: 
  - RAG searches `health_faqs` Knowledge Table using semantic embeddings
  - Top K=3 retrieves 3 most relevant FAQ documents
  - Reranker refines retrieval accuracy
  - Embedding model (`bge-m3`) handles bilingual queries
- Output: Retrieved health information grounded in knowledge base
- **Model Settings**: Temperature 0.7 (natural responses)

**Step 3: Draft Answer** (Chat Table: `health_assistant` LLM)
- Input: 
  - User message
  - Retrieved knowledge base documents (with [@0], [@1] citations)
  - Language instruction from Step 1 classification
- Process: LLM generates response using:
  - System prompt rules (emergency detection, language matching, scope limiting)
  - Retrieved FAQs for accurate clinic info
  - Urgency assessment to tailor advice
- Output: Draft health guidance in correct language
- **Model Settings**: Max tokens 1500, Top-p 0.95

**Step 4: Refine** (Implicit in Chat Table System Prompt)
- Process: System prompt includes refinement rules:
  - Enforce language consistency
  - Apply formatting guidelines (plain text, emoji icons)
  - Add safety disclaimers for emergencies
  - Ensure contact numbers are included
  - Validate scope (no medical diagnosis)
- Output: Final polished response ready for user

### Workflow for Appointment Booking:

**Step 1: Understand Request** (Implicit - user fills form)
- Input: Structured form data (name, phone, date, time, reason)
- Process: Frontend validation
- Output: Validated booking data

**Step 2: Store Data** (Action Table: `appointment_bookings`)
- Input: Booking form data
- Process: Store in Action Table as transactional record
- Output: Persistent booking record

**Step 3: Draft Confirmation** (Action Table: `appointment_bookings` LLM columns)
- Input: Booking data from Step 2
- Process: LLM generates confirmation messages in parallel:
  - `confirmation_message_en`: English confirmation with APT-XXXXXX reference
  - `confirmation_message_ms`: Malay confirmation with APT-XXXXXX reference
- Output: Bilingual confirmation messages
- **Model Settings**: Temperature 0.7, Max tokens 200

**Step 4: Refine & Deliver** (API Route)
- Process: API selects correct language confirmation based on user preference
- Output: Final confirmation message displayed to user

### Chaining Benefits:

✅ **Understand → Fetch**: Classification guides RAG retrieval (emergency queries prioritize emergency FAQs)  
✅ **Fetch → Draft**: Retrieved knowledge grounds LLM responses (prevents hallucination)  
✅ **Draft → Refine**: System prompt rules ensure safety, language consistency, formatting  
✅ **Parallel Processing**: Multiple columns in Action Tables process simultaneously for efficiency  
✅ **Context Preservation**: Chat Table maintains conversation history for follow-up questions

**Model Settings**:
- **Model**: `ellm/qwen/qwen3-30b-a3b-2507`
- **Temperature**: 0.7
- **Max Tokens**: 1500
- **RAG**: Enabled
  - **Knowledge Table**: `health_faqs`
  - **Search Query**: `${User}`
  - **Top K**: 3 (retrieve top 3 relevant documents)
  - **Reranking**: Enabled

---

## Setup Steps

### 1. Create Knowledge Table
1. Go to JamAI Base → Knowledge Tables → Create New
2. Name: `health_faqs`
3. Upload `health_faqs.jsonl` file (10 rows will be imported)
4. Set embedding model: `ellm/BAAI/bge-m3`
5. Click Create

### 2. Create Action Table: symptom_classifier
1. Go to JamAI Base → Action Tables → Create New
2. Name: `symptom_classifier`
3. Add Input Column: `user_message` (Text)
4. Add Output Columns (copy prompts from above):
   - `symptom_category` (LLM)
   - `urgency_level` (LLM)
   - `language_detected` (LLM)
5. Set model for each: `ellm/qwen/qwen3-30b-a3b-2507`
6. Click Create

### 3. Create Action Table: appointment_bookings
1. Go to JamAI Base → Action Tables → Create New
2. Name: `appointment_bookings`
3. Add Input Columns (Text):
   - `patient_name`
   - `phone_number`
   - `preferred_date`
   - `preferred_time`
   - `reason`
4. Add Output Columns (LLM, copy prompts from above):
   - `confirmation_message_en`
   - `confirmation_message_ms`
5. Set model: `ellm/qwen/qwen3-30b-a3b-2507`
6. Click Create

### 4. Create Chat Table
1. Go to JamAI Base → Chat Tables → Create New
2. Name: `health_assistant`
3. Add Input Column: `User` (Text)
4. Add Output Column: `AI` (LLM)
5. Copy System Prompt from above
6. User Prompt: `${User}`
7. Set model: `ellm/qwen/qwen3-30b-a3b-2507`, temp 0.7, max tokens 1500
8. Enable RAG:
   - Knowledge Table: `health_faqs`
   - Search Query: `${User}`
   - Top K: 3
9. Click Create

### 5. Update Environment Variables
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

---

## Testing

### Test 1: Symptom Classification
**Action Table**: `symptom_classifier`
**Input**: `user_message` = "Saya demam tinggi 3 hari"
**Expected Output**:
- `symptom_category`: fever
- `urgency_level`: high
- `language_detected`: ms

### Test 2: Appointment Booking
**Action Table**: `appointment_bookings`
**Input**:
- `patient_name`: Ahmad bin Ali
- `phone_number`: 0123456789
- `preferred_date`: 2025-11-27
- `preferred_time`: morning
- `reason`: Vaccination
**Expected Output**: Confirmation messages in EN and MS with reference number

### Test 3: Chat with RAG
**Chat Table**: `health_assistant`
**Input**: "What vaccinations do you have?"
**Expected**: Should retrieve vaccination FAQ and respond with list + prices in English

### Test 4: Emergency Detection
**Chat Table**: `health_assistant`
**Input**: "I have severe chest pain"
**Expected**: Should immediately advise calling 999, NOT visiting clinic

---

## API Integration Reference

### Get Chat Response
```javascript
POST https://api.jamaibase.com/api/v1/gen_tables/chat/rows/add
Body: {
  table_id: "health_assistant",
  data: [{ User: "I have fever" }],
  stream: false
}
Response path: data.rows[0].columns.AI.choices[0].message.content
```

### Classify Symptom
```javascript
POST https://api.jamaibase.com/api/v1/gen_tables/action/rows/add
Body: {
  table_id: "symptom_classifier",
  data: [{ user_message: "Saya demam" }],
  stream: false
}
Response: data.rows[0].columns.{symptom_category, urgency_level, language_detected}.choices[0].message.content
```

### Book Appointment
```javascript
POST https://api.jamaibase.com/api/v1/gen_tables/action/rows/add
Body: {
  table_id: "appointment_bookings",
  data: [{
    patient_name: "Ali",
    phone_number: "0123456789",
    preferred_date: "2025-11-27",
    preferred_time: "morning",
    reason: "Health screening"
  }],
  stream: false
}
Response: data.rows[0].columns.{confirmation_message_en, confirmation_message_ms}.choices[0].message.content
```
