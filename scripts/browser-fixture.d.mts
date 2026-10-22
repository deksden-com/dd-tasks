import type { Browser, TestInfo } from "@playwright/test";

export { expect, test } from "@playwright/test";
export function observeInactivity(
  browser: Browser,
  use: () => Promise<void>,
  info: TestInfo,
): Promise<void>;
