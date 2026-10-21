import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createRequire } from 'module';

export const dynamic = 'force-dynamic';

const require = createRequire(import.meta.url);
const engine = require('../../../../lib/server/unifiedFeedbackEngine.cjs');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hdrs: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      hdrs[k] = v;
    });
    const auth = engine.verifyAdminAccess(hdrs, '127.0.0.1');
    if (!auth.authorized) {
      return NextResponse.json(
        { ok: false, authorized: false, error: `Admin access restricted to ${engine.ADMIN_EMAIL}` },
        { status: 403 }
      );
    }
    const localStorePath = path.resolve(process.cwd(), '.local_backup/user_feedback.json');
    const res = await engine.updateFeedbackStatus({
      feedbackId: String(body.id || body.feedbackId || ''),
      newStatus: body.status || null,
      deleteItem: Boolean(body.delete),
      localStorePath,
    });
    return NextResponse.json(res);
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to update feedback' },
      { status: 400 }
    );
  }
}
