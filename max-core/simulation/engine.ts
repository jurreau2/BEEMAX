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
  /** D1 invariant: replay divergence is exactly zero for a matching deterministic run. */
  readonly divergence: 0;
}
export interface SimulationProvenance<T = unknown> {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly stepMs: 1000;
  readonly records: readonly SimulationRecord<T>[];
}

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Deterministic 1Hz simulation runner. Wall-clock scheduling remains the host's responsibility. */
export class SimulationEngine<T> {
  private state: T;
  private tickIndex = 0;
  private readonly records: SimulationRecord<T>[] = [];
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

  exportProvenance(): SimulationProvenance<T> {
    return Object.freeze({
      modelId: this.model.id,
      modelVersion: this.model.version,
      stepMs: 1000,
      records: this.records.map((record) => copy(record)),
    });
  }

  /** Re-executes recorded inputs from initial state and reports whether outputs match exactly. */
  verifyReplay(): { readonly valid: boolean; readonly divergence: number } {
    let state = copy(this.model.initial);
    for (const record of this.records) {
      state = copy(this.model.step(state, {
        tick: record.tick,
        stepMs: 1000,
        inputs: copy(record.inputs),
      }));
      if (JSON.stringify(state) !== JSON.stringify(record.output))
        return { valid: false, divergence: 1 };
    }
    return { valid: true, divergence: 0 };
  }
}
