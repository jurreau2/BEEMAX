import type { AdapterContract } from "../../contracts/index.js";
import { createAdapter, type HostCapabilities } from "../hosts.js";
/** The host supplies storage and privileged bridges for desktop. */
export function createDesktopAdapter(capabilities: HostCapabilities): AdapterContract {
  return createAdapter("desktop", capabilities);
}
