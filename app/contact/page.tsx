"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "general_support",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setTicketId("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data?.ticket?.id) {
        throw new Error(data?.error || "Could not submit support request.");
      }
      setTicketId(data.ticket.id);
      setForm({ ...form, subject: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit support request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="grid gap-5 border-b border-slate-200 pb-7 md:grid-cols-[minmax(0,1fr)_280px] md:items-stretch">
          <div className="flex flex-col justify-end">
            <p className="text-sm font-semibold text-violet-600">Support</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em]">How can we help?</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Send a product, account, legal, or technical request. Your submission is stored as a real support ticket.
            </p>
          </div>
          <div className="relative min-h-44 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img src="/assets/avatars/avatar_fireside_journey.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-sm font-semibold text-white">We’ll help you get unstuck.</div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {ticketId ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="font-semibold text-emerald-900">Request received</h2>
                  <p className="mt-1 text-sm text-emerald-800">
                    Ticket <strong>{ticketId}</strong> has been recorded.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-2 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 rounded-xl border border-slate-200 bg-white px-3">
                <option value="general_support">Technical support</option>
                <option value="account">Account</option>
                <option value="publishing">Publishing</option>
                <option value="legal">Legal / copyright</option>
                <option value="privacy">Privacy</option>
                <option value="feedback">Product feedback</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Subject
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Message
              <textarea required rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
            </label>

            {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="flex justify-end">
              <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit request
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
