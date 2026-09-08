import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("qualifies native select keyboard behavior independently of persistence", async ({
  page,
  browser,
}, testInfo) => {
  await page.setContent(
    '<label for="choice">Example choice</label><select id="choice"><option value="one">One</option><option value="two">Two</option><option value="three">Three</option></select>',
  );
  const select = page.getByRole("combobox", { name: "Example choice" });
  await select.focus();
  await expect(select).toBeFocused();
  const before = await select.inputValue();
  await select.press("ArrowDown");
  await select.press("Enter");
  const after = await select.inputValue();
  const evidence = {
    schema_id: "dd-tasks/keyboard-qualification@1",
    platform: process.platform,
    browser: browser.version(),
    before,
    after,
    keys: ["ArrowDown", "Enter"],
    qualified: after === "two",
    scope: "native select only; does not prove product accessibility",
  };
  const file = testInfo.outputPath("keyboard-qualification.json");
  await writeFile(file, JSON.stringify(evidence, null, 2));
  await testInfo.attach("keyboard qualification", {
    path: file,
    contentType: "application/json",
  });
  console.log(JSON.stringify(evidence));
  test.skip(
    !evidence.qualified,
    "Native select arrow behavior is not qualified on this browser/platform",
  );
});
