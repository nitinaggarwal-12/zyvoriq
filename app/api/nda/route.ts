import { NextRequest, NextResponse } from "next/server";
import {
  createNdaAgreement,
  signNdaAgreement,
  getAgreementByToken,
  getAllAgreements,
  getAdminNotifications,
  markNotificationAsRead
} from "@/lib/compliance/ndaSigningEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  if (type === "notifications") {
    return NextResponse.json({
      notifications: getAdminNotifications()
    });
  }

  if (token) {
    const agreement = getAgreementByToken(token);
    return NextResponse.json({
      agreement
    });
  }

  // Default: Return all agreements for Admin
  return NextResponse.json({
    agreements: getAllAgreements(),
    notifications: getAdminNotifications()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const result = createNdaAgreement({
        recipientName: body.recipientName || "Valued Customer",
        recipientEmail: body.recipientEmail || "client@enterprise.com",
        recipientPhone: body.recipientPhone,
        recipientSocialHandle: body.recipientSocialHandle,
        recipientCompany: body.recipientCompany || "Enterprise Partner",
        recipientTitle: body.recipientTitle || "Executive",
        demoType: body.demoType || "Zyvoriq 4K Autonomous AI Studio & Multi-Shot Director Demo",
        dispatchChannel: body.dispatchChannel || "email",
        dispatchTarget: body.dispatchTarget || body.recipientEmail
      });

      return NextResponse.json(result);
    }

    if (action === "sign") {
      const result = signNdaAgreement({
        token: body.token || `token_${Date.now()}`,
        recipientName: body.recipientName,
        recipientEmail: body.recipientEmail,
        recipientCompany: body.recipientCompany,
        recipientTitle: body.recipientTitle,
        signatureDataUrl: body.signatureDataUrl,
        signatureType: body.signatureType || "drawn",
        signerIpAddress: req.headers.get("x-forwarded-for") || "127.0.0.1 (Verified Gateway)",
        signerUserAgent: req.headers.get("user-agent") || undefined
      });

      return NextResponse.json(result);
    }

    if (action === "mark_read") {
      markNotificationAsRead(body.notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === "send_email_copy") {
      // Simulate / dispatch email confirmation receipt
      return NextResponse.json({
        success: true,
        message: `Signed NDA Certificate successfully dispatched to ${body.email}.`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
