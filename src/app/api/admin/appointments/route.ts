import { NextRequest, NextResponse } from "next/server";

const JAMAI_API_KEY = process.env.JAMAI_API_KEY;
const JAMAI_BASE_URL = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com";
const ACTION_TABLE_APPOINTMENT = process.env.ACTION_TABLE_APPOINTMENT || "appointment_bookings";
const JAMAI_PROJECT_ID = process.env.JAMAI_PROJECT_ID;

// GET - Fetch all appointments
export async function GET(request: NextRequest) {
  try {
    // Validate API credentials
    if (!JAMAI_API_KEY || JAMAI_API_KEY.includes("your_")) {
      return NextResponse.json(
        { error: "JamAI API key not configured" },
        { status: 500 }
      );
    }

    // Fetch appointments from Action Table (list rows)
    const url = new URL(`${JAMAI_BASE_URL}/api/v2/gen_tables/action/rows/list`);
    url.searchParams.set("table_id", ACTION_TABLE_APPOINTMENT);
    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", "0");

    let response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${JAMAI_API_KEY}`,
        "Accept": "application/json",
        ...(JAMAI_PROJECT_ID ? { "X-PROJECT-ID": JAMAI_PROJECT_ID } : {}),
      },
    });
    
    // Fallback: try alternate path style
    if (!response.ok) {
      const altUrl = new URL(`${JAMAI_BASE_URL}/api/v1/gen_tables/action/rows`);
      altUrl.searchParams.set("table_id", ACTION_TABLE_APPOINTMENT);
      altUrl.searchParams.set("limit", "200");
      altUrl.searchParams.set("offset", "0");
      if (JAMAI_PROJECT_ID) altUrl.searchParams.set("project_id", JAMAI_PROJECT_ID);
      response = await fetch(altUrl.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${JAMAI_API_KEY}`,
          "Accept": "application/json",
          ...(JAMAI_PROJECT_ID ? { "X-PROJECT-ID": JAMAI_PROJECT_ID } : {}),
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch appointments:", errorData);
        return NextResponse.json(
          { error: errorData?.message || "Failed to fetch appointments" },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const rawRows: any[] = (data.rows || data.items || data) ?? [];

    // Normalize JamAI row shapes to flat objects for the dashboard
    const appointments = rawRows.map((row: any) => {
      const getVal = (v: any) => (v && typeof v === "object" && "value" in v ? v.value : v);
      return {
        ID: getVal(row.ID),
        patient_name: getVal(row.patient_name ?? row["patient_name"]),
        phone_number: getVal(row.phone_number ?? row["phone_number"]),
        preferred_date: getVal(row.preferred_date ?? row["preferred_date"]),
        preferred_time: getVal(row.preferred_time ?? row["preferred_time"]),
        prefered_time: getVal(row.prefered_time ?? row["prefered_time"]),
        reason: getVal(row.reason ?? row["reason"]),
        current_state: getVal(row.current_state ?? row["current_state"] ?? row.appointment_status ?? row["appointment_status"]),
        doctor_notes: getVal(row.doctor_notes ?? row["doctor_notes"]),
        confirmation_message: getVal(row.confirmation_message ?? row["confirmation_message"] ?? row.confirmation_message_en ?? row["confirmation_message_en"]),
        created_at: getVal(row.updated_at ?? row["Updated at"] ?? row.created_at ?? row["created_at"]),
      };
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment status
export async function PATCH(request: NextRequest) {
  try {
    const { rowId, status, doctorNotes } = await request.json();

    if (!rowId || (!status && typeof doctorNotes !== "string")) {
      return NextResponse.json(
        { error: "Row ID and either status or doctorNotes is required" },
        { status: 400 }
      );
    }

    // Validate status (align with current_state column)
    const validStatuses = ["Booked", "In Progress", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
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

    // Update appointment status in Action Table (update row)
    const updateUrl = `${JAMAI_BASE_URL}/api/v1/gen_tables/action/rows/update`;
    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${JAMAI_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        table_id: ACTION_TABLE_APPOINTMENT,
        row_id: rowId,
        project_id: JAMAI_PROJECT_ID || undefined,
        data: {
          ...(status ? { current_state: status } : {}),
          ...(typeof doctorNotes === "string" ? { doctor_notes: doctorNotes } : {}),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to update appointment:", errorData);
      return NextResponse.json(
        { error: "Failed to update appointment status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: "Appointment status updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
