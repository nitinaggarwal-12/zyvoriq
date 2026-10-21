import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface FeedbackRecord {
  id: string;
  createdAt: string;
  timestampEst: string;
  appId: string;
  appName: string;
  pageUrl: string;
  category: string;
  priority: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  subject: string;
  message: string;
  contextMeta?: Record<string, unknown>;
  status: string;
  updatedAt: string;
}

interface DeliveryStatus {
  recipientEmail: string;
  persistedToLocalStore: boolean;
  persistedToSharedLedger: boolean;
  persistedToGoogleSheet: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  driveCommentNotificationId?: string | null;
  gmailComposeUrl: string;
  mailtoUrl: string;
}

interface UniversalFeedbackProps {
  appId: string;
  appName: string;
  currentRoute?: string;
  defaultSenderEmail?: string;
  defaultSenderName?: string;
  contextMeta?: Record<string, unknown>;
  onOpenAdminPage?: () => void;
}

const CATEGORIES = [
  'Bug / Blocker',
  'Feature Request',
  'UI / UX Polish',
  'Data / Grounding',
  'General',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['New', 'Triaged', 'In Progress', 'Resolved'];

export const FeedbackHeaderEmailButton: React.FC<UniversalFeedbackProps> = ({
  appId,
  appName,
  currentRoute,
  defaultSenderEmail = '',
  defaultSenderName = '',
  contextMeta = {},
  onOpenAdminPage,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [category, setCategory] = useState('Bug / Blocker');
  const [priority, setPriority] = useState('Medium');
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [senderEmail, setSenderEmail] = useState(defaultSenderEmail);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<FeedbackRecord | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryStatus | null>(null);

  const resolvedRoute =
    currentRoute ||
    (typeof window !== 'undefined'
      ? window.location.pathname + window.location.search + window.location.hash
      : '/');

  const handleOpenModal = () => {
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleNavigateAdmin = () => {
    setModalOpen(false);
    if (onOpenAdminPage) {
      onOpenAdminPage();
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/admin/feedback';
      url.searchParams.set('page', 'admin-feedback');
      window.location.href = url.toString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter a feedback message before submitting.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          appName,
          pageUrl: resolvedRoute,
          category,
          priority,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          message: message.trim(),
          contextMeta: {
            ...contextMeta,
            url: typeof window !== 'undefined' ? window.location.href : resolvedRoute,
            viewport:
              typeof window !== 'undefined'
                ? `${window.innerWidth}x${window.innerHeight}`
                : 'unknown',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Submission failed (${res.status})`);
      }
      setSubmittedRecord(data.feedback);
      setDeliveryInfo(data.delivery);
      setMessage('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="relative inline-flex items-center"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <button
          type="button"
          id="top-corner-feedback-email-btn"
          data-testid="give-feedback-email-icon-btn"
          title="Give Feedback to nitinagga@google.com"
          aria-label="Give Feedback to nitinagga@google.com"
          onClick={handleOpenModal}
          onFocus={() => setTooltipVisible(true)}
          onBlur={() => setTooltipVisible(false)}
          className="inline-flex items-center justify-center gap-1.5 min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-blue-700 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span className="hidden sm:inline">Feedback</span>
        </button>

        {tooltipVisible && (
          <div
            role="tooltip"
            data-testid="give-feedback-email-tooltip"
            className="
              pointer-events-none absolute right-0 top-full mt-1.5 z-50
              px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-bold
              whitespace-nowrap shadow-lg border border-slate-700
            "
          >
            Give Feedback to nitinagga@google.com
          </div>
        )}
      </div>

      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          data-testid="give-feedback-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="give-feedback-modal-title"
            data-testid="give-feedback-modal"
            className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2
                    id="give-feedback-modal-title"
                    className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug"
                  >
                    Give Feedback to nitinagga@google.com
                  </h2>
                  <p className="text-xs text-slate-600 truncate">
                    App: <span className="font-bold text-slate-800">{appName}</span> · Route:{' '}
                    <code className="font-mono text-[11px] bg-slate-200/70 px-1 py-0.5 rounded">
                      {resolvedRoute}
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="feedback-open-admin-page-btn"
                  onClick={handleNavigateAdmin}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                  title="Open Admin-Only Feedback Inbox Page"
                >
                  🔒 Admin Inbox ↗
                </button>
                <button
                  type="button"
                  data-testid="give-feedback-modal-close-btn"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold cursor-pointer"
                  aria-label="Close Feedback Modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {submittedRecord && deliveryInfo ? (
                <div
                  data-testid="feedback-submit-success"
                  className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-emerald-950">
                        ✅ Feedback Recorded &amp; Synced ({submittedRecord.id})
                      </div>
                      <div className="text-xs text-emerald-800 mt-0.5">
                        Submitted at {submittedRecord.timestampEst} for{' '}
                        <span className="font-bold">{submittedRecord.appName}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-200/80 text-emerald-950">
                      {submittedRecord.priority} · {submittedRecord.category}
                    </span>
                  </div>

                  <div className="text-xs bg-white rounded-lg p-3 border border-emerald-200 text-slate-800 whitespace-pre-wrap">
                    {submittedRecord.message}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white/80 rounded-lg p-2.5 border border-emerald-200">
                    <div>
                      • Local &amp; Cross-App Store:{' '}
                      <span className="font-bold text-emerald-800">Saved</span>
                    </div>
                    <div>
                      • Live Google Sheet Ledger:{' '}
                      <span className="font-bold text-emerald-800">
                        {deliveryInfo.persistedToGoogleSheet ? 'Synced Live' : 'Local Only'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        data-testid="feedback-success-view-admin-btn"
                        onClick={handleNavigateAdmin}
                        className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                      >
                        View All Messages on Admin Page →
                      </button>
                      <a
                        href={deliveryInfo.gmailComposeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="feedback-success-gmail-btn"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300"
                      >
                        ✉️ Open in Gmail Compose ↗
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedRecord(null);
                        setDeliveryInfo(null);
                      }}
                      className="text-xs font-bold text-emerald-900 underline cursor-pointer"
                    >
                      Send Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div
                      role="alert"
                      className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-rose-900"
                    >
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="fb-category-select"
                        className="block text-xs font-extrabold text-slate-700 mb-1"
                      >
                        Feedback Category
                      </label>
                      <select
                        id="fb-category-select"
                        data-testid="feedback-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="fb-priority-select"
                        className="block text-xs font-extrabold text-slate-700 mb-1"
                      >
                        Priority Level
                      </label>
                      <select
                        id="fb-priority-select"
                        data-testid="feedback-priority-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="fb-sender-name"
                        className="block text-xs font-extrabold text-slate-700 mb-1"
                      >
                        Your Name (Optional)
                      </label>
                      <input
                        id="fb-sender-name"
                        type="text"
                        data-testid="feedback-sender-name-input"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g., Nitin Aggarwal"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="fb-sender-email"
                        className="block text-xs font-extrabold text-slate-700 mb-1"
                      >
                        Your Email (Optional)
                      </label>
                      <input
                        id="fb-sender-email"
                        type="email"
                        data-testid="feedback-sender-email-input"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="user@google.com"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="fb-message-textarea"
                      className="block text-xs font-extrabold text-slate-700 mb-1"
                    >
                      Feedback Message for <span className="text-blue-700">nitinagga@google.com</span>{' '}
                      *
                    </label>
                    <textarea
                      id="fb-message-textarea"
                      data-testid="feedback-message-textarea"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe what worked well, what needs fixing, or what feature you would like added..."
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      Persists to Unified Cross-App Feedback Ledger &amp; Admin Inbox
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        data-testid="feedback-submit-btn"
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs cursor-pointer"
                      >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

interface AdminFeedbackInboxPageProps {
  appId: string;
  appName: string;
  onBackToApp: () => void;
}

export const AdminFeedbackInboxPage: React.FC<AdminFeedbackInboxPageProps> = ({
  appId,
  appName,
  onBackToApp,
}) => {
  const [messages, setMessages] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<'all' | 'app'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAllApps, setTotalAllApps] = useState(0);
  const [totalCurrentApp, setTotalCurrentApp] = useState(0);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1iPv52nblJISD7WNeEe3m4VovG_JS1qh79MYftMxrnhY/edit'
  );
  const [authMode, setAuthMode] = useState('localhost_dev_session');

  const fetchFeedback = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          scope,
          category: categoryFilter === 'All' ? '' : categoryFilter,
          priority: priorityFilter === 'All' ? '' : priorityFilter,
          status: statusFilter === 'All' ? '' : statusFilter,
          search: searchQuery,
          force: force ? '1' : '0',
        });
        const res = await fetch(`/api/feedback/messages?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Failed to load feedback (${res.status})`);
        }
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setTotalAllApps(Number(data.totalAllApps || 0));
        setTotalCurrentApp(Number(data.totalCurrentApp || 0));
        if (data.spreadsheetUrl) setSpreadsheetUrl(data.spreadsheetUrl);
        if (data.authMode) setAuthMode(data.authMode);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load admin feedback inbox');
      } finally {
        setLoading(false);
      }
    },
    [scope, categoryFilter, priorityFilter, statusFilter, searchQuery]
  );

  useEffect(() => {
    fetchFeedback(false);
  }, [fetchFeedback]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/feedback/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/feedback/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delete: true }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        fetchFeedback(true);
      }
    } catch {
      // ignore
    }
  };

  const openNewCount = messages.filter(
    (m) => m.status === 'New' || m.status === 'Triaged'
  ).length;
  const highCritCount = messages.filter(
    (m) => m.priority === 'High' || m.priority === 'Critical'
  ).length;

  return (
    <div
      data-testid="admin-feedback-inbox-page"
      className="min-h-screen w-full bg-slate-50 text-slate-900 p-4 sm:p-6 space-y-5"
    >
      {/* Top Executive Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            data-testid="admin-feedback-back-btn"
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer whitespace-nowrap"
          >
            ← Back to {appName}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                Admin Feedback Inbox — nitinagga@google.com
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                🔒 Admin Verified ({authMode})
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Real-time user feedback submitted across all workspace apps, reconciled with the live
              Google Sheet ledger (0 synthetic rows).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
            <button
              type="button"
              data-testid="admin-feedback-scope-all-btn"
              onClick={() => setScope('all')}
              className={`px-3 py-1 rounded-md text-xs font-extrabold transition-colors cursor-pointer ${
                scope === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              All Apps ({totalAllApps})
            </button>
            <button
              type="button"
              data-testid="admin-feedback-scope-app-btn"
              onClick={() => setScope('app')}
              className={`px-3 py-1 rounded-md text-xs font-extrabold transition-colors cursor-pointer ${
                scope === 'app'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {appName} Only ({totalCurrentApp})
            </button>
          </div>

          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="admin-feedback-sheet-link"
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap"
          >
            📊 Live Google Sheet Ledger ↗
          </a>

          <button
            type="button"
            data-testid="admin-feedback-refresh-btn"
            onClick={() => fetchFeedback(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 cursor-pointer whitespace-nowrap"
          >
            ↻ Refresh
          </button>

          <FeedbackHeaderEmailButton
            appId={appId}
            appName={appName}
            currentRoute="/admin/feedback"
            onOpenAdminPage={() => fetchFeedback(true)}
          />
        </div>
      </div>

      {/* 4-Card KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Total Feedback (All Apps)
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalAllApps}</div>
          <div className="text-xs text-slate-600 mt-0.5">
            Synced across local JSON &amp; Google Sheets
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
            {appName} Submissions
          </div>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">{totalCurrentApp}</div>
          <div className="text-xs text-slate-600 mt-0.5">App ID: {appId}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
            Open / Needs Triage
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{openNewCount}</div>
          <div className="text-xs text-slate-600 mt-0.5">Status: New or Triaged</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
            High / Critical Priority
          </div>
          <div className="text-2xl font-extrabold text-rose-900 mt-1">{highCritCount}</div>
          <div className="text-xs text-slate-600 mt-0.5">Requires immediate attention</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center gap-3">
        <input
          type="search"
          data-testid="admin-feedback-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search feedback message, ID, sender, route, or app..."
          className="flex-1 min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
        />

        <select
          aria-label="Filter by Category"
          data-testid="admin-feedback-filter-category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
        >
          <option value="All">All Categories ({totalCurrentApp})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Priority"
          data-testid="admin-feedback-filter-priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
        >
          <option value="All">All Priorities ({totalCurrentApp})</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Status"
          data-testid="admin-feedback-filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
        >
          <option value="All">All Statuses ({totalCurrentApp})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Rigid Table Cell Containment (Rule 26) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-sm font-bold text-rose-800 bg-rose-50">
            ⚠️ {error}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">
            Loading real-time feedback ledger...
          </div>
        ) : messages.length === 0 ? (
          <div
            data-testid="admin-feedback-empty-state"
            className="p-10 text-center space-y-2"
          >
            <div className="text-sm font-extrabold text-slate-800">
              0 Feedback Messages Match Current View
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Strictly zero fake or synthetic rows are pre-populated. Click the{' '}
              <span className="font-bold text-blue-700">Feedback</span> email button in the top-right
              corner to submit a real feedback message.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              data-testid="admin-feedback-table"
              className="w-full table-fixed border-collapse text-left"
            >
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  <th className="w-[15%] px-3.5 py-3">ID &amp; Timestamp (ET)</th>
                  <th className="w-[15%] px-3.5 py-3">App &amp; Route</th>
                  <th className="w-[14%] px-3.5 py-3">Category &amp; Priority</th>
                  <th className="w-[14%] px-3.5 py-3">Sender</th>
                  <th className="w-[26%] px-3.5 py-3">Feedback Message</th>
                  <th className="w-[16%] px-3.5 py-3">Status &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {messages.map((item) => {
                  const priColor =
                    item.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : item.priority === 'Medium'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300';

                  const replyUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    item.senderEmail && item.senderEmail !== 'anonymous'
                      ? item.senderEmail
                      : 'nitinagga@google.com'
                  )}&su=${encodeURIComponent(`Re: ${item.subject}`)}`;

                  return (
                    <tr
                      key={item.id}
                      data-testid={`admin-feedback-row-${item.id}`}
                      className="hover:bg-slate-50/80 align-top"
                    >
                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3 space-y-1"
                      >
                        <div className="font-mono font-extrabold text-[11px] text-slate-900 break-words">
                          {item.id}
                        </div>
                        <div className="text-[11px] text-slate-500 break-words">
                          {item.timestampEst}
                        </div>
                      </td>

                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3 space-y-1"
                      >
                        <div className="font-extrabold text-slate-900 break-words">
                          {item.appName}
                        </div>
                        <div className="font-mono text-[11px] text-blue-700 break-all">
                          {item.pageUrl}
                        </div>
                      </td>

                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3 space-y-1.5"
                      >
                        <div className="font-bold text-slate-800 break-words">{item.category}</div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${priColor}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3 space-y-0.5"
                      >
                        <div className="font-bold text-slate-900 break-words">
                          {item.senderName || 'Workspace User'}
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 break-all">
                          {item.senderEmail || 'anonymous'}
                        </div>
                      </td>

                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3"
                      >
                        <div className="text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
                          {item.message}
                        </div>
                      </td>

                      <td
                        style={{ overflow: 'hidden', maxWidth: 0 }}
                        className="px-3.5 py-3 space-y-2"
                      >
                        <select
                          aria-label={`Status for ${item.id}`}
                          data-testid={`admin-feedback-status-select-${item.id}`}
                          value={item.status || 'New'}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-extrabold text-slate-900"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <a
                            href={replyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            Reply ↗
                          </a>
                          <button
                            type="button"
                            data-testid={`admin-feedback-delete-btn-${item.id}`}
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
