import { NextRequest, NextResponse } from "next/server";

const JAMAI_API_KEY = process.env.JAMAI_API_KEY;
const JAMAI_BASE_URL = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com";
const JAMAI_PROJECT_ID = process.env.JAMAI_PROJECT_ID;
const CHAT_TABLE_ID = process.env.CHAT_TABLE_ID || "health_assistant";
const ACTION_TABLE_SYMPTOM = process.env.ACTION_TABLE_SYMPTOM || "symptom_classifier";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Debug: Log what we're actually loading
    console.log("Environment check:");
    console.log("- JAMAI_API_KEY exists:", !!JAMAI_API_KEY);
    console.log("- JAMAI_API_KEY value:", JAMAI_API_KEY?.substring(0, 15) + "...");
    console.log("- All env vars:", Object.keys(process.env).filter(k => k.startsWith('JAMAI')));
    
    // Validate API credentials
    if (!JAMAI_API_KEY || JAMAI_API_KEY.includes("your_")) {
      console.error("Invalid API key detected:", JAMAI_API_KEY?.substring(0, 20));
      return NextResponse.json(
        { error: "JamAI API key not configured. Please update .env.local with your actual API key." },
        { status: 500 }
      );
    }

    // Step 1: Classify symptoms using Action Table
    const classifyResponse = await fetch(`${JAMAI_BASE_URL}/api/v1/gen_tables/action/rows/add`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${JAMAI_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        table_id: ACTION_TABLE_SYMPTOM,
        data: [{ user_message: message }],
        stream: false,
      }),
    });

    let classification = {
      symptom_category: "unknown",
      language: "unknown",
      urgency: "unknown",
    };

    if (classifyResponse.ok) {
      const classifyData = await classifyResponse.json();
      classification = {
        symptom_category: classifyData.rows?.[0]?.columns?.symptom_category?.choices?.[0]?.message?.content || "unknown",
        language: classifyData.rows?.[0]?.columns?.language_detected?.choices?.[0]?.message?.content || "unknown",
        urgency: classifyData.rows?.[0]?.columns?.urgency_level?.choices?.[0]?.message?.content || "unknown",
      };
      console.log("Symptom classification:", classification);
    } else {
      console.error("Classification failed:", await classifyResponse.text());
    }

    // Step 2: Get AI response from Chat Table with language instruction
    const languageInstruction = classification.language === "en" 
      ? "RESPOND IN ENGLISH ONLY." 
      : classification.language === "ms" 
      ? "RESPOND IN BAHASA MALAYSIA ONLY." 
      : "";

    // Use the gen_tables/chat/rows/add endpoint (v1 API - simpler and works)
    const response = await fetch(`${JAMAI_BASE_URL}/api/v1/gen_tables/chat/rows/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JAMAI_API_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        table_id: CHAT_TABLE_ID,
        data: [{ User: `${languageInstruction} ${message}` }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("JamAI API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract AI response - the correct path is rows[0].columns.AI.choices[0].message.content
    const aiContent = data.rows?.[0]?.columns?.AI?.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      console.error("Failed to extract AI response. Full response:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "Failed to extract AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      response: aiContent,
      metadata: {
        symptomCategory: classification.symptom_category,
        language: classification.language,
        urgency: classification.urgency,
      }
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
