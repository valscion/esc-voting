"use client";

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface TVErrorBoundaryProps {
  children: ReactNode;
}

interface TVErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  autoReloadCountdown: number;
  userInteracted: boolean;
}

const AUTO_RELOAD_SECONDS = 5;

/**
 * Error boundary for the TV display page.
 *
 * When an error is caught, it shows a full-screen error screen with a
 * "Reload page" button. The button auto-clicks after 5 seconds unless
 * the user moves the mouse or presses a key (indicating a human is
 * in control and may want to inspect the error first).
 */
class TVErrorBoundaryInner extends Component<
  TVErrorBoundaryProps,
  TVErrorBoundaryState
> {
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(props: TVErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      autoReloadCountdown: AUTO_RELOAD_SECONDS,
      userInteracted: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<TVErrorBoundaryState> {
    return {
      hasError: true,
      error,
      autoReloadCountdown: AUTO_RELOAD_SECONDS,
      userInteracted: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[TVErrorBoundary] Caught error:", error, errorInfo);
  }

  componentDidUpdate(
    _prevProps: TVErrorBoundaryProps,
    prevState: TVErrorBoundaryState,
  ): void {
    if (this.state.hasError && !prevState.hasError) {
      this.startAutoReload();
    }
  }

  componentWillUnmount(): void {
    this.cleanup();
  }

  private startAutoReload(): void {
    this.cleanup();

    window.addEventListener("mousemove", this.handleUserInteraction);
    window.addEventListener("keydown", this.handleUserInteraction);
    window.addEventListener("touchstart", this.handleUserInteraction);

    this.countdownTimer = setInterval(() => {
      this.setState((prev) => {
        if (prev.userInteracted) return null;
        const next = prev.autoReloadCountdown - 1;
        if (next <= 0) {
          window.location.reload();
          return null;
        }
        return { autoReloadCountdown: next };
      });
    }, 1000);
  }

  private cleanup(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    window.removeEventListener("mousemove", this.handleUserInteraction);
    window.removeEventListener("keydown", this.handleUserInteraction);
    window.removeEventListener("touchstart", this.handleUserInteraction);
  }

  private handleUserInteraction = (): void => {
    if (!this.state.userInteracted) {
      this.setState({ userInteracted: true });
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, autoReloadCountdown, userInteracted } = this.state;
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-950 p-8 text-center">
          <p className="mb-4 text-6xl">⚠️</p>
          <h1 className="mb-2 text-3xl font-bold text-red-400">
            Something went wrong
          </h1>
          <p className="mb-6 max-w-lg text-lg text-gray-400">
            The TV player encountered an error. You can reload the page to try
            again.
          </p>
          {error && (
            <pre className="mb-6 max-w-2xl overflow-auto rounded-lg bg-gray-900 p-4 text-left text-sm text-gray-500">
              {error.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Reload page
          </button>
          {!userInteracted && (
            <p className="mt-4 text-lg text-gray-500">
              Auto-reloading in {autoReloadCountdown}s…
            </p>
          )}
          {userInteracted && (
            <p className="mt-4 text-lg text-gray-600">
              Auto-reload paused — click the button when ready
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper function component so that rwsdk's RSC bundler correctly
 * registers this "use client" export as a client reference.
 */
export function TVErrorBoundary({ children }: TVErrorBoundaryProps) {
  return <TVErrorBoundaryInner>{children}</TVErrorBoundaryInner>;
}
