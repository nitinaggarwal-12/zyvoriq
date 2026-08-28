"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-slate-950/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl space-y-5 my-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-white font-serif">
              {this.props.fallbackTitle || "Studio Component Recovered"}
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              {this.state.error?.message || "An unexpected rendering event occurred. The studio core has safely isolated this panel."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>

            <Link
              href="/studio"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-medium transition-all flex items-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Cinema Stage</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
