export type AdapterKind = "provider" | "renderer" | "telemetry" | "transport" | "storage";
export type AdapterState =
  | "CONNECTED"
  | "DEGRADED"
  | "STALE"
  | "BLOCKED"
  | "DISCONNECTED"
  | "UNCONFIGURED";

/** Identity metadata is provenance, not a cryptographic authentication mechanism. */
export const SOVEREIGN_IDENTITY_ANCHOR = "bba28add4f99bd9aae158f173168145d";

export interface AdapterRegistration<T = unknown> {
  readonly kind: AdapterKind;
  readonly id: string;
  readonly identityAnchor: string;
  readonly state: AdapterState;
  readonly adapter: T;
}

/** Small explicit registry for runtime bindings; no provider is assumed active by default. */
export class AdapterRegistry {
  private readonly registrations = new Map<string, AdapterRegistration>();

  register<T>(registration: AdapterRegistration<T>): void {
    if (!registration.id.trim()) throw new TypeError("adapter id is required");
    if (!registration.identityAnchor.trim())
      throw new TypeError("identity anchor is required");
    const key = `${registration.kind}:${registration.id}`;
    if (this.registrations.has(key))
      throw new Error(`Adapter already registered: ${key}`);
    this.registrations.set(key, Object.freeze({ ...registration }));
  }

  replace<T>(registration: AdapterRegistration<T>): void {
    const key = `${registration.kind}:${registration.id}`;
    if (!this.registrations.has(key)) throw new Error(`Adapter not found: ${key}`);
    this.registrations.set(key, Object.freeze({ ...registration }));
  }

  get<T = unknown>(kind: AdapterKind, id: string): AdapterRegistration<T> | undefined {
    return this.registrations.get(`${kind}:${id}`) as AdapterRegistration<T> | undefined;
  }

  list(kind?: AdapterKind): readonly AdapterRegistration[] {
    return [...this.registrations.values()].filter((item) => !kind || item.kind === kind);
  }
}
