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
    const localStorePath = path.resolve(process.cwd(), '.local_backup/user_feedback.json');
    const res = await engine.submitFeedback(
      body,
      'zyvoriq',
      'Zyvoriq Content Studio',
      localStorePath,
      hdrs
    );
    return NextResponse.json(res);
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to submit feedback' },
      { status: 400 }
    );
  }
}
