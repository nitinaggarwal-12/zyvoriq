import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createRequire } from 'module';

export const dynamic = 'force-dynamic';

const require = createRequire(import.meta.url);
const engine = require('../../../../lib/server/unifiedFeedbackEngine.cjs');

export async function GET(req: NextRequest) {
  try {
    const hdrs: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      hdrs[k] = v;
    });
    const url = new URL(req.url);
    const qp: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      qp[k] = v;
    });

    const auth = engine.verifyAdminAccess(hdrs, '127.0.0.1', qp);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          ok: false,
          authorized: false,
          resolvedEmail: auth.resolvedEmail,
          authMode: auth.authMode,
          error: `Admin access restricted to ${engine.ADMIN_EMAIL}`,
        },
        { status: 403 }
      );
    }

    const localStorePath = path.resolve(process.cwd(), '.local_backup/user_feedback.json');
    const payload = await engine.listFeedback({
      defaultAppId: 'zyvoriq',
      localStorePath,
      scope: url.searchParams.get('scope') || 'all',
      categoryFilter: url.searchParams.get('category') || '',
      priorityFilter: url.searchParams.get('priority') || '',
      statusFilter: url.searchParams.get('status') || '',
      searchQuery: url.searchParams.get('search') || url.searchParams.get('q') || '',
      forceSheetRefresh: url.searchParams.get('force') === '1',
    });

    payload.authorized = true;
    payload.resolvedEmail = auth.resolvedEmail;
    payload.authMode = auth.authMode;
    return NextResponse.json(payload);
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to list feedback' },
      { status: 500 }
    );
  }
}
