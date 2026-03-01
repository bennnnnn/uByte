"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <span className="text-4xl">😵</span>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-500">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
