/**
 * Unified Cross-App Feedback Engine (Node.js CommonJS) — nitinagga@google.com
 * Strictly zero fake/synthetic/seed data. Only real user-submitted feedback is stored.
 *
 * Persists to:
 * 1. App-local JSON store (.local_backup/user_feedback.json)
 * 2. Shared local cross-app ledger (/Users/nitinagga/.gemini/config/shared_app_feedback_ledger.json)
 * 3. Live Google Sheet ("Unified App Feedback Ledger (nitinagga@google.com)",
 *    spreadsheetId: 1iPv52nblJISD7WNeEe3m4VovG_JS1qh79MYftMxrnhY, tab: FeedbackInbox)
 *    via OAuth 2.0 refresh_token with x-goog-user-project: ramp-portal-dev.
 * 4. Google Drive API comment on the live Feedback Sheet mentioning nitinagga@google.com.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_EMAIL = 'nitinagga@google.com';
const DEFAULT_SPREADSHEET_ID = '1iPv52nblJISD7WNeEe3m4VovG_JS1qh79MYftMxrnhY';
const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;
const DEFAULT_SHEET_NAME = 'FeedbackInbox';
const QUOTA_PROJECT = 'ramp-portal-dev';

const CONFIG_PATH = '/Users/nitinagga/.gemini/config/unified_feedback_config.json';
const SHARED_LEDGER_PATH = '/Users/nitinagga/.gemini/config/shared_app_feedback_ledger.json';

const TOKEN_CANDIDATE_PATHS = [
  path.resolve(process.cwd(), '.gsheet_oauth_token.json'),
  '/Users/nitinagga/Documents/gantry-pulse/.gsheet_oauth_token.json',
  '/Users/nitinagga/Documents/blogs/.gsheet_oauth_token.json',
  '/Users/nitinagga/Documents/PromptCanvas/.gsheet_oauth_token.json',
];

const VALID_CATEGORIES = [
  'Bug / Blocker',
  'Feature Request',
  'UI / UX Polish',
  'Data / Grounding',
  'General',
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_STATUSES = ['New', 'Triaged', 'In Progress', 'Resolved'];

let tokenCache = { accessToken: null, expiresAt: 0 };
let sheetCache = { items: null, fetchedAt: 0 };

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (_) {}
  return {
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    sheetName: DEFAULT_SHEET_NAME,
    adminEmail: ADMIN_EMAIL,
    quotaProject: QUOTA_PROJECT,
    sharedLedgerPath: SHARED_LEDGER_PATH,
  };
}

async function getOAuthAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }
  for (const tf of TOKEN_CANDIDATE_PATHS) {
    try {
      if (fs.existsSync(tf)) {
        const td = JSON.parse(fs.readFileSync(tf, 'utf-8'));
        if (td.refresh_token && td.client_id && td.client_secret) {
          const body = new URLSearchParams({
            client_id: td.client_id,
            client_secret: td.client_secret,
            refresh_token: td.refresh_token,
            grant_type: 'refresh_token',
          });
          const resp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          });
          if (resp.ok) {
            const payload = await resp.json();
            if (payload.access_token) {
              tokenCache.accessToken = payload.access_token;
              tokenCache.expiresAt = now + (Number(payload.expires_in || 3500) - 120) * 1000;
              return payload.access_token;
            }
          }
        }
      }
    } catch (_) {}
  }
  return null;
}

function normalizeIapEmail(rawHeader) {
  if (!rawHeader) return '';
  let val = String(rawHeader).trim();
  if (val.includes(':')) {
    val = val.split(':').slice(1).join(':').trim();
  }
  return val.toLowerCase();
}

function verifyAdminAccess(headers = {}, remoteAddr = '', _queryParams = {}) {
  const hdrs = {};
  for (const [k, v] of Object.entries(headers || {})) {
    if (v !== undefined && v !== null) {
      hdrs[String(k).toLowerCase()] = Array.isArray(v) ? v[0] : String(v);
    }
  }
  const iapEmail = normalizeIapEmail(hdrs['x-goog-authenticated-user-email']);
  if (iapEmail) {
    if (iapEmail === ADMIN_EMAIL) {
      return { authorized: true, resolvedEmail: iapEmail, authMode: 'iap_verified' };
    }
    return { authorized: false, resolvedEmail: iapEmail, authMode: 'iap_denied_non_admin' };
  }

  if (Boolean(process.env.K_SERVICE)) {
    return { authorized: false, resolvedEmail: 'anonymous', authMode: 'denied' };
  }

  const rawHostHdr = String(hdrs['host'] || '').trim().toLowerCase();
  const addr = String(remoteAddr || '').trim().toLowerCase();
  const hasForwardedIp = Boolean(String(hdrs['x-forwarded-for'] || '').trim());
  const isLoopbackAddr = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(addr);
  const isLoopbackHost =
    rawHostHdr === 'localhost' ||
    rawHostHdr === '127.0.0.1' ||
    rawHostHdr === '[::1]' ||
    rawHostHdr.startsWith('localhost:') ||
    rawHostHdr.startsWith('127.0.0.1:') ||
    rawHostHdr.startsWith('[::1]:');
  const hasNonLoopbackAddr = Boolean(addr) && !isLoopbackAddr;
  const hasNonLoopbackHost = Boolean(rawHostHdr) && !isLoopbackHost;
  const isStrictLoopback =
    !hasForwardedIp &&
    !hasNonLoopbackAddr &&
    !hasNonLoopbackHost &&
    (isLoopbackAddr || isLoopbackHost);

  if (isStrictLoopback) {
    return { authorized: true, resolvedEmail: ADMIN_EMAIL, authMode: 'localhost_dev_session' };
  }

  return { authorized: false, resolvedEmail: 'anonymous', authMode: 'unauthorized' };
}

function readJsonList(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data)) return data.filter((x) => x && x.id);
      if (data && Array.isArray(data.items)) return data.items.filter((x) => x && x.id);
    }
  } catch (_) {}
  return [];
}

function writeJsonList(filePath, items) {
  try {
    if (!filePath) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (_) {}
}

async function fetchSheetFeedbackItems(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && sheetCache.items && now - sheetCache.fetchedAt < 8000) {
    return [...sheetCache.items];
  }
  const cfg = loadConfig();
  const spreadsheetId = cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const sheetName = cfg.sheetName || DEFAULT_SHEET_NAME;
  const token = await getOAuthAccessToken();
  if (!token || !spreadsheetId) return sheetCache.items || [];

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A2:N1000`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-user-project': cfg.quotaProject || QUOTA_PROJECT,
      },
    });
    if (!resp.ok) return sheetCache.items || [];
    const payload = await resp.json();
    const rows = payload.values || [];
    const items = [];
    rows.forEach((row, idx) => {
      if (!row || !String(row[0] || '').trim()) return;
      const padded = [...row, '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
      const fbId = String(padded[0]).trim();
      const tsEst = String(padded[1]).trim();
      const appId = String(padded[2]).trim();
      const appName = String(padded[3]).trim();
      const pageUrl = String(padded[4]).trim();
      const category = String(padded[5]).trim() || 'General';
      const priority = String(padded[6]).trim() || 'Medium';
      const senderEmail = String(padded[7]).trim();
      const senderName = String(padded[8]).trim();
      const subject = String(padded[9]).trim();
      const message = String(padded[10]).trim();
      const metaRaw = String(padded[11]).trim();
      const status = String(padded[12]).trim() || 'New';
      const updatedAt = String(padded[13]).trim() || tsEst;

      let contextMeta = {};
      if (metaRaw) {
        try {
          contextMeta = JSON.parse(metaRaw);
        } catch (_) {
          contextMeta = { raw: metaRaw };
        }
      }
      items.push({
        id: fbId,
        timestampEst: tsEst,
        createdAt: contextMeta.createdAt || updatedAt || tsEst,
        appId,
        appName,
        pageUrl,
        category,
        priority,
        senderEmail,
        senderName,
        recipientEmail: ADMIN_EMAIL,
        subject,
        message,
        contextMeta,
        status,
        updatedAt,
        sheetRowNumber: idx + 2,
        sourceStore: 'google_sheet',
      });
    });
    sheetCache.items = items;
    sheetCache.fetchedAt = now;
    return items;
  } catch (_) {
    return sheetCache.items || [];
  }
}

async function appendFeedbackToGoogleSheet(record) {
  const cfg = loadConfig();
  const spreadsheetId = cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const sheetName = cfg.sheetName || DEFAULT_SHEET_NAME;
  const token = await getOAuthAccessToken();
  if (!token || !spreadsheetId) {
    return { sheetOk: false, commentId: null, error: 'missing_oauth_token' };
  }
  const metaObj = { ...(record.contextMeta || {}), createdAt: record.createdAt || '' };
  const rowValues = [
    [
      record.id || '',
      record.timestampEst || '',
      record.appId || '',
      record.appName || '',
      record.pageUrl || '',
      record.category || 'General',
      record.priority || 'Medium',
      record.senderEmail || '',
      record.senderName || '',
      record.subject || '',
      record.message || '',
      JSON.stringify(metaObj),
      record.status || 'New',
      record.updatedAt || '',
    ],
  ];
  let sheetOk = false;
  let commentId = null;
  let error = null;
  try {
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:N:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const resp = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': cfg.quotaProject || QUOTA_PROJECT,
      },
      body: JSON.stringify({ values: rowValues }),
    });
    if (resp.ok) {
      sheetOk = true;
      sheetCache.items = null;
    } else {
      error = `Sheet HTTP ${resp.status}`;
    }
  } catch (err) {
    error = err.message;
  }

  try {
    const commentBody = {
      content: `New Feedback for +${ADMIN_EMAIL}\nApp: ${record.appName} (${record.appId})\nCategory: ${record.category} | Priority: ${record.priority}\nFrom: ${record.senderName || 'User'} <${record.senderEmail || 'unspecified'}>\nPage: ${record.pageUrl}\n\n${record.message}`,
    };
    const cResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/comments?fields=id,createdTime`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-goog-user-project': cfg.quotaProject || QUOTA_PROJECT,
        },
        body: JSON.stringify(commentBody),
      }
    );
    if (cResp.ok) {
      const cData = await cResp.json();
      commentId = cData.id || null;
    }
  } catch (_) {}

  return { sheetOk, commentId, error };
}

function formatEstTimestamp(dateObj) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(dateObj);
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  const tsEst = `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ET`;
  const compact = `${map.year}${map.month}${map.day}-${map.hour}${map.minute}${map.second}`;
  return { tsEst, compact };
}

async function submitFeedback(payload, defaultAppId, defaultAppName, localStorePath, headers = {}) {
  const message = String(payload.message || '').trim();
  if (!message) {
    throw new Error('Feedback message is required and cannot be empty.');
  }
  let category = String(payload.category || 'General').trim();
  if (!VALID_CATEGORIES.includes(category)) category = 'General';

  let priority = String(payload.priority || 'Medium').trim();
  if (!VALID_PRIORITIES.includes(priority)) priority = 'Medium';

  const appId = String(payload.appId || defaultAppId).trim();
  const appName = String(payload.appName || defaultAppName).trim();
  const pageUrl = String(payload.pageUrl || payload.route || '/').trim();

  const hdrs = {};
  for (const [k, v] of Object.entries(headers || {})) {
    if (v !== undefined && v !== null) hdrs[String(k).toLowerCase()] = String(v);
  }
  const iapEmail = normalizeIapEmail(hdrs['x-goog-authenticated-user-email']);
  const senderEmail = String(payload.senderEmail || iapEmail || '').trim();
  let senderName = String(payload.senderName || '').trim();
  if (!senderName && senderEmail && senderEmail.includes('@')) {
    senderName = senderEmail.split('@')[0];
  }

  const now = new Date();
  const createdIso = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const { tsEst, compact } = formatEstTimestamp(now);
  const digest = crypto
    .createHash('sha256')
    .update(`${appId}:${createdIso}:${message}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
  const fbId = `FB-${compact}-${digest}`;

  let shortMsg = message.replace(/\s+/g, ' ');
  if (shortMsg.length > 64) shortMsg = shortMsg.slice(0, 61) + '...';
  const subject = String(
    payload.subject || `[${appName}] [${priority}] ${category}: ${shortMsg}`
  ).trim();

  const contextMeta =
    payload.contextMeta && typeof payload.contextMeta === 'object'
      ? { ...payload.contextMeta }
      : {};
  contextMeta.createdAt = createdIso;
  if (iapEmail) contextMeta.iapAuthenticatedEmail = iapEmail;

  const record = {
    id: fbId,
    createdAt: createdIso,
    timestampEst: tsEst,
    appId,
    appName,
    pageUrl,
    category,
    priority,
    senderEmail: senderEmail || 'anonymous',
    senderName: senderName || 'Workspace User',
    recipientEmail: ADMIN_EMAIL,
    subject,
    message,
    contextMeta,
    status: 'New',
    updatedAt: createdIso,
  };

  let persistedLocal = false;
  if (localStorePath) {
    const localItems = readJsonList(localStorePath);
    localItems.unshift(record);
    writeJsonList(localStorePath, localItems);
    persistedLocal = true;
  }

  const sharedItems = readJsonList(SHARED_LEDGER_PATH).filter((x) => x.id !== fbId);
  sharedItems.unshift(record);
  writeJsonList(SHARED_LEDGER_PATH, sharedItems);

  const { sheetOk, commentId, error: sheetErr } = await appendFeedbackToGoogleSheet(record);
  const cfg = loadConfig();

  const emailBody = `App: ${appName} (${appId})\nPage / Route: ${pageUrl}\nCategory: ${category}\nPriority: ${priority}\nFeedback ID: ${fbId}\nSubmitted At: ${tsEst}\n\nMessage:\n${message}\n`;
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ADMIN_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  return {
    ok: true,
    feedback: record,
    delivery: {
      recipientEmail: ADMIN_EMAIL,
      persistedToLocalStore: persistedLocal,
      persistedToSharedLedger: true,
      persistedToGoogleSheet: sheetOk,
      spreadsheetId: cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: cfg.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
      driveCommentNotificationId: commentId,
      sheetError: sheetErr,
      gmailComposeUrl,
      mailtoUrl,
    },
  };
}

async function listFeedback({
  defaultAppId,
  localStorePath = null,
  scope = 'all',
  categoryFilter = '',
  priorityFilter = '',
  statusFilter = '',
  searchQuery = '',
  forceSheetRefresh = false,
}) {
  const mergedById = new Map();

  if (localStorePath) {
    for (const item of readJsonList(localStorePath)) {
      if (item && item.id) mergedById.set(String(item.id), { ...item });
    }
  }

  for (const item of readJsonList(SHARED_LEDGER_PATH)) {
    if (item && item.id) mergedById.set(String(item.id), { ...item });
  }

  const sheetItems = await fetchSheetFeedbackItems(forceSheetRefresh);
  for (const item of sheetItems) {
    if (item && item.id) {
      const existing = mergedById.get(String(item.id));
      if (existing && String(existing.updatedAt || '') > String(item.updatedAt || '')) {
        continue;
      }
      mergedById.set(String(item.id), { ...item });
    }
  }

  const allItems = Array.from(mergedById.values()).sort((a, b) =>
    String(b.createdAt || b.timestampEst || '').localeCompare(
      String(a.createdAt || a.timestampEst || '')
    )
  );

  const appCounts = {};
  const statusCounts = { New: 0, Triaged: 0, 'In Progress': 0, Resolved: 0 };
  const priorityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };

  for (const it of allItems) {
    const aid = String(it.appId || 'unknown');
    appCounts[aid] = (appCounts[aid] || 0) + 1;
    const st = String(it.status || 'New');
    statusCounts[st] = (statusCounts[st] || 0) + 1;
    const pr = String(it.priority || 'Medium');
    priorityCounts[pr] = (priorityCounts[pr] || 0) + 1;
  }

  let filtered = allItems;
  if (scope === 'app' && defaultAppId) {
    filtered = filtered.filter(
      (x) => String(x.appId || '').toLowerCase() === defaultAppId.toLowerCase()
    );
  } else if (scope && !['all', 'app'].includes(scope)) {
    filtered = filtered.filter((x) => String(x.appId || '').toLowerCase() === scope.toLowerCase());
  }

  if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
    filtered = filtered.filter(
      (x) => String(x.category || '').toLowerCase() === categoryFilter.toLowerCase()
    );
  }
  if (priorityFilter && priorityFilter.toLowerCase() !== 'all') {
    filtered = filtered.filter(
      (x) => String(x.priority || '').toLowerCase() === priorityFilter.toLowerCase()
    );
  }
  if (statusFilter && statusFilter.toLowerCase() !== 'all') {
    filtered = filtered.filter(
      (x) => String(x.status || '').toLowerCase() === statusFilter.toLowerCase()
    );
  }
  if (searchQuery) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (x) =>
        String(x.message || '').toLowerCase().includes(q) ||
        String(x.subject || '').toLowerCase().includes(q) ||
        String(x.senderEmail || '').toLowerCase().includes(q) ||
        String(x.senderName || '').toLowerCase().includes(q) ||
        String(x.pageUrl || '').toLowerCase().includes(q) ||
        String(x.id || '').toLowerCase().includes(q) ||
        String(x.appName || '').toLowerCase().includes(q)
    );
  }

  const cfg = loadConfig();
  return {
    ok: true,
    adminEmail: ADMIN_EMAIL,
    currentAppId: defaultAppId,
    scope,
    totalAllApps: allItems.length,
    totalCurrentApp: allItems.filter(
      (x) => String(x.appId || '').toLowerCase() === String(defaultAppId || '').toLowerCase()
    ).length,
    filteredCount: filtered.length,
    appCounts,
    statusCounts,
    priorityCounts,
    spreadsheetId: cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: cfg.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
    messages: filtered,
  };
}

async function updateFeedbackStatus({
  feedbackId,
  newStatus = null,
  deleteItem = false,
  localStorePath = null,
}) {
  const fid = String(feedbackId || '').trim();
  if (!fid) throw new Error('feedbackId is required.');
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  if (localStorePath && fs.existsSync(localStorePath)) {
    let localItems = readJsonList(localStorePath);
    if (deleteItem) {
      localItems = localItems.filter((x) => x.id !== fid);
    } else {
      localItems.forEach((x) => {
        if (x.id === fid && VALID_STATUSES.includes(newStatus)) {
          x.status = newStatus;
          x.updatedAt = nowIso;
        }
      });
    }
    writeJsonList(localStorePath, localItems);
  }

  let sharedItems = readJsonList(SHARED_LEDGER_PATH);
  let updatedRecord = null;
  if (deleteItem) {
    sharedItems = sharedItems.filter((x) => x.id !== fid);
  } else {
    sharedItems.forEach((x) => {
      if (x.id === fid) {
        if (VALID_STATUSES.includes(newStatus)) {
          x.status = newStatus;
          x.updatedAt = nowIso;
        }
        updatedRecord = { ...x };
      }
    });
  }
  writeJsonList(SHARED_LEDGER_PATH, sharedItems);

  const cfg = loadConfig();
  const spreadsheetId = cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const sheetName = cfg.sheetName || DEFAULT_SHEET_NAME;
  const token = await getOAuthAccessToken();
  let sheetUpdated = false;
  if (token && spreadsheetId) {
    try {
      const sheetItems = await fetchSheetFeedbackItems(true);
      const target = sheetItems.find((it) => it.id === fid);
      if (target && target.sheetRowNumber) {
        const rowNum = target.sheetRowNumber;
        if (deleteItem) {
          const clrUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A${rowNum}:N${rowNum}:clear`;
          const r = await fetch(clrUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-goog-user-project': cfg.quotaProject || QUOTA_PROJECT,
            },
            body: '{}',
          });
          sheetUpdated = r.ok;
        } else if (VALID_STATUSES.includes(newStatus)) {
          const updUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!M${rowNum}:N${rowNum}?valueInputOption=USER_ENTERED`;
          const r = await fetch(updUrl, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-goog-user-project': cfg.quotaProject || QUOTA_PROJECT,
            },
            body: JSON.stringify({ values: [[newStatus, nowIso]] }),
          });
          sheetUpdated = r.ok;
        }
        sheetCache.items = null;
      }
    } catch (_) {}
  }

  return {
    ok: true,
    id: fid,
    deleted: deleteItem,
    status: newStatus,
    updatedAt: nowIso,
    sheetUpdated,
    feedback: updatedRecord,
  };
}

module.exports = {
  ADMIN_EMAIL,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  VALID_STATUSES,
  verifyAdminAccess,
  submitFeedback,
  listFeedback,
  updateFeedbackStatus,
};
