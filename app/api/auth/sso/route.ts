import { NextRequest, NextResponse } from "next/server";
import {
  authenticateWithSso,
  getActiveSsoSession,
  clearSsoSession,
  SsoProvider,
  SSO_PRESET_PROFILES
} from "@/lib/auth/ssoVerificationEngine";

export async function GET(req: NextRequest) {
  try {
    const session = getActiveSsoSession();
    return NextResponse.json({
      isAuthenticated: !!session,
      session,
      availableProviders: ["google", "linkedin", "apple", "github", "twitter_x"]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get session" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider } = body;

    if (action === "login") {
      const profile = authenticateWithSso(provider as SsoProvider || "google");
      return NextResponse.json({
        success: true,
        message: `Successfully authenticated via ${provider.toUpperCase()}. Extracted verified legal name, age tier, and place claims.`,
        session: profile
      });
    }

    if (action === "logout") {
      clearSsoSession();
      return NextResponse.json({
        success: true,
        message: "SSO Session cleared."
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "SSO operation failed" }, { status: 500 });
  }
}
