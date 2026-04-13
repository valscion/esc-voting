"use client";

/**
 * Drop-in replacement for rwsdk's `useSyncedState` with automatic WebSocket
 * reconnection. When the underlying capnweb WebSocket connection drops (detected
 * via `onRpcBroken` and periodic health checks), the client is recreated,
 * all active subscriptions are re-established, and the latest server state is
 * fetched to bring the UI back in sync — all without a page reload.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { newWebSocketRpcSession, type RpcStub } from "capnweb";

const DEFAULT_SYNCED_STATE_PATH = "/__synced-state";
const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

// Minimal interface for the RPC client returned by capnweb
interface RpcClient {
  getState(key: string): Promise<unknown>;
  setState(value: unknown, key: string): Promise<void>;
  subscribe(key: string, handler: (value: unknown) => void): Promise<void>;
  unsubscribe(key: string, handler: (value: unknown) => void): Promise<void>;
}

interface Subscription {
  key: string;
  handler: (value: unknown) => void;
}

/**
 * Manages a WebSocket RPC connection with automatic reconnection.
 * Tracks subscriptions and re-subscribes after reconnection.
 */
class ReconnectingClient {
  #endpoint: string;
  #client: RpcClient | null = null;
  #subscriptions = new Set<Subscription>();
  #reconnecting = false;
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  #reconnectAttempts = 0;
  #reconnectListeners = new Set<() => void>();
  #disposed = false;

  constructor(endpoint: string) {
    this.#endpoint = endpoint;
    this.#connect();
  }

  #connect(): void {
    if (this.#disposed) return;
    try {
      const stub = newWebSocketRpcSession(
        this.#endpoint,
      ) as unknown as RpcStub<RpcClient>;

      this.#client = stub as unknown as RpcClient;
      this.#reconnectAttempts = 0;

      // Detect connection break via capnweb's onRpcBroken
      stub.onRpcBroken(() => {
        console.warn("[ReconnectingClient] Connection broken, will reconnect");
        this.#client = null;
        this.#scheduleReconnect();
      });
    } catch (e) {
      console.error("[ReconnectingClient] Failed to connect:", e);
      this.#scheduleReconnect();
    }
  }

  #scheduleReconnect(): void {
    if (this.#disposed || this.#reconnecting) return;
    this.#reconnecting = true;

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this.#reconnectAttempts),
      RECONNECT_MAX_DELAY_MS,
    );
    this.#reconnectAttempts++;

    console.log(
      `[ReconnectingClient] Reconnecting in ${delay}ms (attempt ${this.#reconnectAttempts})`,
    );

    this.#reconnectTimer = setTimeout(() => {
      this.#reconnecting = false;
      this.#connect();

      if (this.#client) {
        // Re-subscribe all active subscriptions
        for (const sub of this.#subscriptions) {
          void this.#client.subscribe(sub.key, sub.handler).catch((e) => {
            console.error(
              "[ReconnectingClient] Re-subscribe failed:",
              sub.key,
              e,
            );
          });
        }
        // Notify listeners to refresh state
        for (const listener of this.#reconnectListeners) {
          listener();
        }
      }
    }, delay);
  }

  async getState(key: string): Promise<unknown> {
    if (!this.#client) return undefined;
    try {
      return await this.#client.getState(key);
    } catch {
      return undefined;
    }
  }

  async setState(value: unknown, key: string): Promise<void> {
    if (!this.#client) return;
    try {
      await this.#client.setState(value, key);
    } catch (e) {
      console.warn("[ReconnectingClient] setState failed:", e);
    }
  }

  async subscribe(sub: Subscription): Promise<void> {
    this.#subscriptions.add(sub);
    if (this.#client) {
      try {
        await this.#client.subscribe(sub.key, sub.handler);
      } catch (e) {
        console.warn("[ReconnectingClient] subscribe failed:", e);
      }
    }
  }

  async unsubscribe(sub: Subscription): Promise<void> {
    this.#subscriptions.delete(sub);
    if (this.#client) {
      try {
        await this.#client.unsubscribe(sub.key, sub.handler);
      } catch {
        // Ignore errors during unsubscribe
      }
    }
  }

  onReconnect(listener: () => void): () => void {
    this.#reconnectListeners.add(listener);
    return () => this.#reconnectListeners.delete(listener);
  }

  /**
   * Performs a health check by attempting to get state.
   * If it fails, triggers reconnection.
   */
  async healthCheck(key: string): Promise<void> {
    if (!this.#client) {
      this.#scheduleReconnect();
      return;
    }
    try {
      await this.#client.getState(key);
    } catch {
      console.warn("[ReconnectingClient] Health check failed, reconnecting");
      this.#client = null;
      this.#scheduleReconnect();
    }
  }

  dispose(): void {
    this.#disposed = true;
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
    }
    this.#subscriptions.clear();
    this.#reconnectListeners.clear();
  }
}

// Cache of reconnecting clients by endpoint URL
const clientCache = new Map<string, ReconnectingClient>();

function getReconnectingClient(endpoint: string): ReconnectingClient {
  let client = clientCache.get(endpoint);
  if (!client) {
    client = new ReconnectingClient(endpoint);
    clientCache.set(endpoint, client);
  }
  return client;
}

// Cleanup all clients on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    for (const client of clientCache.values()) {
      client.dispose();
    }
    clientCache.clear();
  });
}

type Setter<T> = (value: T | ((previous: T) => T)) => void;

/**
 * Resolves the WebSocket endpoint URL for a given room.
 * Returns `null` during SSR (no `window`).
 */
function resolveEndpoint(roomId?: string): string | null {
  if (typeof window === "undefined") return null;

  const resolvedUrl = roomId
    ? `${DEFAULT_SYNCED_STATE_PATH}/${roomId}`
    : DEFAULT_SYNCED_STATE_PATH;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${resolvedUrl}`;
}

/**
 * A drop-in replacement for `useSyncedState` from rwsdk that adds automatic
 * WebSocket reconnection. API is identical:
 *
 *   const [value, setValue] = useSyncedState(initialValue, key, roomId?)
 */
export function useSyncedState<T>(
  initialValue: T,
  key: string,
  roomId?: string,
): [T, Setter<T>] {
  const endpoint = resolveEndpoint(roomId);
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(value);

  // Get or create the reconnecting client for this endpoint (null during SSR)
  const client = useMemo(
    () => (endpoint ? getReconnectingClient(endpoint) : null),
    [endpoint],
  );

  const setSyncValue = useCallback<Setter<T>>(
    (nextValue) => {
      const resolved =
        typeof nextValue === "function"
          ? (nextValue as (previous: T) => T)(valueRef.current)
          : nextValue;
      setValue(resolved);
      valueRef.current = resolved;
      void client?.setState(resolved, key);
    },
    [key, client],
  );

  useEffect(() => {
    if (!client) return; // SSR — nothing to do

    let isActive = true;

    const handleUpdate = (next: unknown) => {
      if (isActive) {
        setValue(next as T);
        valueRef.current = next as T;
      }
    };

    const subscription: Subscription = { key, handler: handleUpdate };

    // Fetch initial state from server
    void client.getState(key).then((existing) => {
      if (existing !== undefined && isActive) {
        setValue(existing as T);
        valueRef.current = existing as T;
      }
    });

    // Subscribe for real-time updates
    void client.subscribe(subscription);

    // After reconnection, refresh state from the server
    const unlistenReconnect = client.onReconnect(() => {
      if (!isActive) return;
      void client.getState(key).then((existing) => {
        if (existing !== undefined && isActive) {
          setValue(existing as T);
          valueRef.current = existing as T;
        }
      });
    });

    // Periodic health check catches silent disconnections (e.g. half-open TCP)
    const healthCheckTimer = setInterval(() => {
      if (!isActive) return;
      void client.healthCheck(key);
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      isActive = false;
      unlistenReconnect();
      clearInterval(healthCheckTimer);
      void client.unsubscribe(subscription).catch((error) => {
        console.error("[useSyncedState] Error during unsubscribe:", error);
      });
    };
  }, [key, client]);

  return [value, setSyncValue];
}
