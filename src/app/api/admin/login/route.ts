import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Load credentials from JSON file
        const credentialsPath = path.join(process.cwd(), "data", "admin-credentials.json");
        const credentialsData = fs.readFileSync(credentialsPath, "utf-8");
        const { admins } = JSON.parse(credentialsData);

        // Find matching admin
        const admin = admins.find(
            (a: any) => a.username === username && a.password === password
        );

        if (!admin) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Generate a simple token (in production, use proper JWT)
        const token = crypto.randomBytes(32).toString("hex");

        return NextResponse.json({
            success: true,
            token,
            name: admin.name,
            role: admin.role,
            id: admin.id,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
