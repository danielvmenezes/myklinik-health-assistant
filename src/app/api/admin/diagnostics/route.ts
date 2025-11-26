import { NextRequest, NextResponse } from "next/server";

const JAMAI_API_KEY = process.env.JAMAI_API_KEY;
const JAMAI_BASE_URL = process.env.JAMAI_BASE_URL || "https://api.jamaibase.com";
const JAMAI_PROJECT_ID = process.env.JAMAI_PROJECT_ID;

export async function GET(request: NextRequest) {
    try {
        if (!JAMAI_API_KEY) {
            return NextResponse.json({ error: "Missing JAMAI_API_KEY" }, { status: 400 });
        }

        const url = new URL(`${JAMAI_BASE_URL}/api/v1/gen_tables/action/tables`);
        url.searchParams.set("count_rows", "true");
        if (JAMAI_PROJECT_ID) url.searchParams.set("project_id", JAMAI_PROJECT_ID);

        const resp = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${JAMAI_API_KEY}`,
                Accept: "application/json",
            },
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            return NextResponse.json({ error: data?.message || "Failed to list tables", raw: data }, { status: resp.status });
        }

        return NextResponse.json({ ok: true, tables: data.items || data.tables || data || [] });
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}