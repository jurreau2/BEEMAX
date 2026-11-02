export type SimulationInput = Readonly<Record<string, unknown>>;
export interface SimulationContext {
  readonly tick: number;
  readonly stepMs: 1000;
  readonly inputs: SimulationInput;
}
export interface SimulationModel<T> {
  readonly id: string;
  readonly version: string;
  readonly initial: T;
  readonly dependencies: readonly string[];
  readonly confidence: number;
  step(state: Readonly<T>, context: SimulationContext): T;
}
export interface SimulationRecord<T = unknown> {
  readonly sequence: number;
  readonly tick: number;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly inputs: SimulationInput;
  readonly dependencies: readonly string[];
  readonly output: T;
  readonly confidence: number;
  readonly provenance: string;
  readonly divergence: 0;
}
export interface SimulationProvenance<T = unknown> {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly stepMs: 1000;
  readonly records: readonly SimulationRecord<T>[];
}
export interface SimulationTickState {
  readonly tickId: number;
  readonly timestamp: number;
  /** Stable diagnostic fingerprint; not a cryptographic integrity proof. */
  readonly stateHash: string;
  readonly identityAnchor: string;
}

const IDENTITY_ANCHOR = "bba28add4f99bd9aae158f173168145d";

function copy<T>(value: T): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new TypeError("Simulation values must be JSON serializable");
  return JSON.parse(serialized) as T;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new TypeError("Simulation state contains a non-JSON value");
  return encoded;
}

function diagnosticFingerprint(value: unknown): string {
  const input = `${stableJson(value)}${IDENTITY_ANCHOR}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `max-fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/** Deterministic logical 1Hz runner; the host must schedule calls to advance/executeTick. */
export class SimulationEngine<T> {
  private state: T;
  private tickIndex = 0;
  private readonly records: SimulationRecord<T>[] = [];
  private readonly historyLog: SimulationTickState[] = [];

  constructor(private readonly model: SimulationModel<T>) {
    if (!model.id.trim() || !model.version.trim())
      throw new TypeError("simulation id and version are required");
    if (!Number.isFinite(model.confidence) || model.confidence < 0 || model.confidence > 1)
      throw new RangeError("confidence must be between 0 and 1");
    this.state = copy(model.initial);
  }

  get tick(): number { return this.tickIndex; }
  get snapshot(): T { return copy(this.state); }

  advance(inputs: SimulationInput = {}): T {
    const immutableInputs = copy(inputs);
    const next = copy(this.model.step(copy(this.state), {
      tick: this.tickIndex,
      stepMs: 1000,
      inputs: immutableInputs,
    }));
    const record: SimulationRecord<T> = Object.freeze({
      sequence: this.records.length,
      tick: this.tickIndex,
      modelId: this.model.id,
      modelVersion: this.model.version,
      inputs: immutableInputs,
      dependencies: [...this.model.dependencies],
      output: copy(next),
      confidence: this.model.confidence,
      provenance: `${this.model.id}@${this.model.version}`,
      divergence: 0,
    });
    this.records.push(record);
    this.state = next;
    this.tickIndex++;
    return this.snapshot;
  }

  /** Records a supplied state at one logical tick. History is isolate-local, not durable storage. */
  executeTick(payloadState: Record<string, unknown>): SimulationTickState {
    const state = copy(payloadState);
    const tickState: SimulationTickState = Object.freeze({
      tickId: ++this.tickIndex,
      timestamp: Date.now(),
      stateHash: diagnosticFingerprint(state),
      identityAnchor: IDENTITY_ANCHOR,
    });
    this.state = state as T;
    this.historyLog.push(tickState);
    // Never expose the object retained in the internal replay log.
    return { ...tickState };
  }

  exportProvenance(): SimulationProvenance<T> {
    return Object.freeze({
      modelId: this.model.id,
      modelVersion: this.model.version,
      stepMs: 1000,
      records: this.records.map((record) => copy(record)),
    });
  }

  getReplayProvenance(): SimulationTickState[] {
    return this.historyLog.map((record) => ({ ...record }));
  }

  verifyReplay(): { readonly valid: boolean; readonly divergence: number } {
    let state = copy(this.model.initial);
    for (const record of this.records) {
      state = copy(this.model.step(state, {
        tick: record.tick,
        stepMs: 1000,
        inputs: copy(record.inputs),
      }));
      if (stableJson(state) !== stableJson(record.output))
        return { valid: false, divergence: 1 };
    }
    return { valid: true, divergence: 0 };
  }
}
