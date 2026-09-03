import { NextRequest, NextResponse } from "next/server";
import {
  getAllModerationReports,
  submitAdminDecision,
  evaluateContentWithAgent
} from "@/lib/compliance/contentModeratorAgent";

export async function GET(req: NextRequest) {
  try {
    const reports = getAllModerationReports();
    const total = reports.length;
    const pending = reports.filter(r => r.adminDecision.status === "PENDING_REVIEW").length;
    const approved = reports.filter(r => r.adminDecision.status === "APPROVED").length;
    const approvedWithWarning = reports.filter(r => r.adminDecision.status === "APPROVED_WITH_WARNING").length;
    const rejected = reports.filter(r => r.adminDecision.status === "REJECTED").length;
    const avgScore = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.overallComplianceScore, 0) / total) : 100;

    return NextResponse.json({
      reports,
      metrics: {
        total,
        pending,
        approved,
        approvedWithWarning,
        rejected,
        avgScore
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch moderation queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "decide") {
      const result = submitAdminDecision({
        reportId: body.reportId,
        status: body.status, // "APPROVED" | "REJECTED" | "APPROVED_WITH_WARNING"
        adminName: body.adminName || "Admin (Nitin Aggarwal)",
        adminNotes: body.adminNotes,
        warningAdvisory: body.warningAdvisory,
        remediationActionRequired: body.remediationActionRequired
      });

      if (!result.success) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, report: result.report });
    }

    if (action === "evaluate") {
      const report = evaluateContentWithAgent({
        contentId: body.contentId || `content_${Date.now()}`,
        contentTitle: body.contentTitle || "Untitled User Project",
        creatorHandle: body.creatorHandle || "@user_creator",
        creatorOrg: body.creatorOrg || "Enterprise Studio",
        modality: body.modality || "video_reel",
        rawContentText: body.rawContentText || ""
      });

      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process moderation request" }, { status: 500 });
  }
}
