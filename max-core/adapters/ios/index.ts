import type { AdapterContract } from "../../contracts/index.js";
import { createAdapter, type HostCapabilities } from "../hosts.js";
/** The host supplies storage and privileged bridges for ios. */
export function createIOSAdapter(capabilities: HostCapabilities): AdapterContract {
  return createAdapter("ios", capabilities);
}
