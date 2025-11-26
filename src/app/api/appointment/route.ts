import { NextRequest, NextResponse } from "next/server";

const JAMAI_API_KEY = process.env.JAMAI_API_KEY;
const JAMAI_BASE_URL = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com";
const ACTION_TABLE_APPOINTMENT = process.env.ACTION_TABLE_APPOINTMENT || "appointment_bookings";

export async function POST(req: NextRequest) {
  try {
    const { patientName, phoneNumber, preferredDate, preferredTime, reason, language } = await req.json();

    // Validate required fields
    if (!patientName || !phoneNumber || !preferredDate || !preferredTime || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate API credentials
    if (!JAMAI_API_KEY || JAMAI_API_KEY.includes("your_")) {
      return NextResponse.json(
        { error: "JamAI API key not configured" },
        { status: 500 }
      );
    }

    // Submit appointment to Action Table
    const response = await fetch(`${JAMAI_BASE_URL}/api/v1/gen_tables/action/rows/add`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${JAMAI_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        table_id: ACTION_TABLE_APPOINTMENT,
        data: [{
          patient_name: patientName,
          phone_number: phoneNumber,
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          reason: reason,
        }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Appointment booking failed:", JSON.stringify(errorData, null, 2));
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract confirmation messages
    const confirmationEn = data.rows?.[0]?.columns?.confirmation_message_en?.choices?.[0]?.message?.content;
    const confirmationMs = data.rows?.[0]?.columns?.confirmation_message_ms?.choices?.[0]?.message?.content;
    
    if (!confirmationEn || !confirmationMs) {
      console.error("Failed to extract confirmation. Full response:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "Failed to generate confirmation" },
        { status: 500 }
      );
    }

    // Return confirmation in requested language
    const confirmation = language === "ms" ? confirmationMs : confirmationEn;

    return NextResponse.json({ 
      success: true,
      confirmation,
      confirmationEn,
      confirmationMs,
    });
  } catch (error: any) {
    console.error("Appointment API Error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment", details: error.message },
      { status: 500 }
    );
  }
}
