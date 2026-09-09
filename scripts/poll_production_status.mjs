import pg from 'pg';

const prodId = process.argv[2] || 'studio1_2c955cf6-914a-4e71-b70d-60185cc7e8b4';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });

async function poll() {
  console.log(`[poll] Monitoring production: ${prodId}`);
  let prevSummary = '';
  let iterations = 0;
  
  while (iterations < 60) { // Poll for up to 8 minutes
    iterations++;
    try {
      const res = await pool.query(
        `SELECT id, target_id, kind, status, attempt, last_error, updated_at 
         FROM reel_operations 
         WHERE production_id = $1 
         ORDER BY created_at ASC`,
        [prodId]
      );
      
      const summary = res.rows.map(r => `${r.target_id || r.kind}:${r.status}`).join(' | ');
      if (summary !== prevSummary) {
        console.log(`[${new Date().toISOString()}] ${summary}`);
        prevSummary = summary;
        
        for (const row of res.rows) {
          if (row.status === 'FAILED') {
            console.error(`[FAILURE] Operation ${row.id} (${row.target_id || row.kind}) failed:`, row.last_error);
          }
        }
      }
      
      const hasRoughCut = res.rows.some(r => r.kind === 'ROUGH_CUT');
      if (hasRoughCut) {
        const rough = res.rows.find(r => r.kind === 'ROUGH_CUT');
        if (rough.status === 'SUCCEEDED' || rough.status === 'FAILED') {
          console.log(`[poll] Pipeline finished with rough cut: ${rough.status}`);
          break;
        }
      }
      
      await new Promise(r => setTimeout(r, 8000));
    } catch (err) {
      console.error(`[poll] Error querying DB:`, err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  await pool.end();
}

poll().catch(e => {
  console.error(e);
  process.exit(1);
});
