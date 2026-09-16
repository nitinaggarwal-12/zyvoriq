import { NextRequest, NextResponse } from 'next/server';
import {
  compileSwarmProductionPlan,
  SWARM_PRODUCTION_PRESETS,
} from '@/lib/swarm/engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultPlan = compileSwarmProductionPlan('cathedral_of_crust');
  return NextResponse.json({
    status: 'ok',
    presets: Object.values(SWARM_PRODUCTION_PRESETS).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      genre: p.genre,
      aspectRatio: p.aspectRatio,
      durationSec: p.durationSec,
    })),
    defaultPlan,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const presetId = body.presetId || 'cathedral_of_crust';
    const plan = compileSwarmProductionPlan(presetId);

    return NextResponse.json({
      status: 'orchestrated',
      plan,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Failed to orchestrate Swarm production plan',
      },
      { status: 500 }
    );
  }
}
