import type { AdapterContract } from "../../contracts/index.js";
import { createAdapter, type HostCapabilities } from "../hosts.js";
/** The host supplies storage and privileged bridges for android. */
export function createAndroidAdapter(capabilities: HostCapabilities): AdapterContract {
  return createAdapter("android", capabilities);
}
