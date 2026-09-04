# 📖 ZYVORIQ OPERATIONAL RUNBOOK & E2E AUTOMATION HARNESS
**Version**: 2.0.0  
**Target Platform**: macOS (Apple Silicon / Intel), Cloudtop (Linux Fallback)  
**Primary Port**: `3000`

---

## 1. Local Environment & Dev Server

### 1.1 Prerequisites
- **Node.js**: 22.x LTS (Supports native `node:sqlite`)
- **Browser**: Official Google Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`)
- **macOS Santa Security Compliance**: Never install or invoke unnotarized Chromium binaries from `~/.cache/puppeteer`.

### 1.2 Starting Dev Server
```bash
# Clean start on standard port 3000
npm run dev

# Check server health
curl -s http://localhost:3000/api/health | jq .
```

---

## 2. Universal E2E Testing Protocol (Zero-Fail macOS Execution)

### 2.1 The Official Chrome Configuration
All Puppeteer automation scripts must launch using the signed system Google Chrome binary with `--headless=new` to avoid endpoint security blocks:

```javascript
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1600,1000"
  ],
  defaultViewport: { width: 1600, height: 1000 }
});
```

### 2.2 Mandatory Synchronization & Settling Rules
1. **800ms Settling Delay**: Always inject `await sleep(800)` immediately following tab clicks, drawer transitions, or modal toggles before capturing screenshots.
2. **Direct DOM Clicks**: Use `page.$eval(selector, el => el.click())` instead of physical coordinate clicks to avoid overlay interception.
3. **Screenshot Storage**: Clean target directory before running (`rm -rf scratch/screenshots_<task_id>`), and save all screenshots inside `<project_root>/scratch/screenshots_<task_id>/`.
4. **Clickable Links**: Present results to users using clickable `file://` Markdown links.

---

## 3. Standard Verification Commands

| Command | Purpose | Expected Exit Code |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | Strict TypeScript compilation check | `0` (Zero errors) |
| `npm run guard:legacy` | Banned legacy tech scanner (SadTalker, mp4v, etc.) | `0` |
| `npm run docs:validate` | Traceability validation across docs | `0` |
| `npm run build` | Next.js 15 production build | `0` |

---

## 4. Troubleshooting & Self-Healing Matrix

### 4.1 `SQLITE_BUSY: database is locked`
- **Cause**: Concurrent writes colliding on SQLite database file (`dev.db`).
- **Resolution**: Zyvoriq implements `withRetry()` in [`lib/db/client.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/db/client.ts) using `Atomics.wait` kernel sleep. If manual intervention is required:
  ```bash
  # Check if a zombie process holds a lock on dev.db
  lsof dev.db
  # WAL checkpoint
  sqlite3 dev.db "PRAGMA wal_checkpoint(TRUNCATE);"
  ```

### 4.2 Port 3000 Already in Use
- **Resolution**: Identify and terminate the lingering process:
  ```bash
  lsof -i :3000
  kill -9 <PID>
  npm run dev
  ```

### 4.3 macOS Santa Blocks Headless Puppeteer
- **Symptom**: `Failed to launch the browser process! Operation not permitted` or instant `SIGKILL`.
- **Resolution**: Ensure `executablePath` in test scripts points to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Never run `npx puppeteer browsers install chrome`.
