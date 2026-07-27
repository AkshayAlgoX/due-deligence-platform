"use client";

import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Catches React errors anywhere in the tree.
 * Wrap high-level components to prevent white-screen crashes.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
    // Production TODO: send to error tracking service (Sentry, LogRocket)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-center text-sm text-gray-600">
            {this.state.error?.message ||
              "An unexpected error occurred while loading this section."}
          </p>

          {/* Dev-only: show stack trace for debugging */}
          {isDev && this.state.errorInfo && (
            <details className="mt-4 max-w-2xl w-full">
              <summary className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-gray-700">
                Show technical details (dev only)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-900 p-3 text-[10px] text-gray-300 font-mono">
                {this.state.error?.stack}
              </pre>
            </details>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#16a34a]"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}