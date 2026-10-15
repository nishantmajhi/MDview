/*
 * The copy buttons on code blocks.
 *
 * The button is appended inside the `<pre>` it copies, because that is what
 * the styles position it against. That makes it part of the block's own text,
 * which is the bug these tests exist for: read the text after the button is
 * there and you copy the word "Copy" along with the code.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { load } = require("./harness.js");

/*
 * `node --test` installs its own `unhandledRejection` handler and blames
 * whichever test was running, so the clipboard-failure checks run in a process
 * of their own. See the header of `tests/rejection.js`.
 */
function refusedCopy(which) {
  const out = execFileSync(
    process.execPath,
    [path.join(__dirname, "rejection.js"), which],
    { encoding: "utf8" },
  );
  return JSON.parse(out);
}

function withCode(markdown) {
  const app = load();
  app.render(markdown);
  return app;
}

const FENCED = "```js\nconst a = 1;\nconst b = 2;\n```\n";

test("every code block gets a button", () => {
  const app = withCode(FENCED + "\n" + FENCED);
  assert.strictEqual(app.mdBody.querySelectorAll(".code-copy-btn").length, 2);
});

test("the button is inside the block, where the styles put it", () => {
  const app = withCode(FENCED);
  const btn = app.mdBody.querySelector(".code-copy-btn");
  assert.strictEqual(btn.parentNode.tagName, "pre");
});

test("the button is labelled for a screen reader", () => {
  const app = withCode(FENCED);
  assert.strictEqual(
    app.mdBody.querySelector(".code-copy-btn").getAttribute("aria-label"),
    "Copy code",
  );
});

test("clicking copies the code", async () => {
  const app = withCode(FENCED);
  app.click(app.mdBody.querySelector(".code-copy-btn"));
  await Promise.resolve();
  assert.deepStrictEqual(app.clipboard.writes, ["const a = 1;\nconst b = 2;\n"]);
});

/*
 * A `<pre>` written as raw HTML has no `<code>` child, so the original fell
 * back to the whole block's text -- which by then included the button it had
 * just appended. Every such copy ended with the word "Copy".
 */
test("a raw HTML pre copies its code and not the button's own label", async () => {
  const app = withCode("<pre>raw block text</pre>\n");
  const btn = app.mdBody.querySelector(".code-copy-btn");
  assert.ok(btn, "a raw <pre> should get a button too");
  app.click(btn);
  await Promise.resolve();
  assert.deepStrictEqual(app.clipboard.writes, ["raw block text"]);
});

test("a pre whose code is wrapped in other markup still excludes the button", async () => {
  const app = withCode("<pre><span>alpha</span> <span>beta</span></pre>\n");
  app.click(app.mdBody.querySelector(".code-copy-btn"));
  await Promise.resolve();
  assert.deepStrictEqual(app.clipboard.writes, ["alpha beta"]);
});

test("nothing that gets copied contains the button's label", async () => {
  const app = withCode(FENCED + "\n<pre>raw</pre>\n\n    indented\n");
  for (const btn of app.mdBody.querySelectorAll(".code-copy-btn")) {
    app.click(btn);
    await Promise.resolve();
  }
  assert.ok(app.clipboard.writes.length >= 3, "expected one write per block");
  for (const written of app.clipboard.writes) {
    assert.ok(!/Copy/.test(written), "copied text contains the button label: " + JSON.stringify(written));
  }
});

/* -- The confirmation state ------------------------------------------------ */

test("the button confirms and then goes back", async () => {
  const app = withCode(FENCED);
  const btn = app.mdBody.querySelector(".code-copy-btn");
  assert.strictEqual(btn.textContent, "Copy");

  app.click(btn);
  await Promise.resolve();
  assert.ok(btn.classList.contains("copied"), "expected the copied class");
  assert.strictEqual(btn.textContent, "Copied!");

  app.clock.tick(1999);
  assert.ok(btn.classList.contains("copied"), "it should still be confirming just under two seconds");

  app.clock.tick(1);
  assert.ok(!btn.classList.contains("copied"));
  assert.strictEqual(btn.textContent, "Copy");
});

test("both states keep an icon", async () => {
  const app = withCode(FENCED);
  const btn = app.mdBody.querySelector(".code-copy-btn");
  assert.strictEqual(btn.querySelectorAll("svg").length, 1, "the resting state has an icon");
  app.click(btn);
  await Promise.resolve();
  assert.strictEqual(btn.querySelectorAll("svg").length, 1, "the confirming state has an icon");
});

test("clicking twice does not leave the confirmation stuck or cut short", async () => {
  const app = withCode(FENCED);
  const btn = app.mdBody.querySelector(".code-copy-btn");

  app.click(btn);
  await Promise.resolve();
  app.clock.tick(1500);
  app.click(btn);
  await Promise.resolve();
  assert.ok(btn.classList.contains("copied"), "the second click must restart the confirmation");

  /* The first click's timer would land here if it had not been cancelled. */
  app.clock.tick(500);
  assert.ok(btn.classList.contains("copied"), "the stale timer must not clear the new confirmation");

  app.clock.tick(1500);
  assert.ok(!btn.classList.contains("copied"), "and it must still clear on its own");
});

/* -- Failure --------------------------------------------------------------- */

/*
 * `navigator.clipboard.writeText` rejects for reasons that have nothing to do
 * with this page -- an unfocused document is the common one. The original had
 * no rejection handler at all, so the failure surfaced as an unhandled promise
 * rejection in the console and the button sat there saying "Copy".
 */
test("a refused copy does not raise an unhandled rejection", () => {
  const result = refusedCopy("current");
  assert.deepStrictEqual(result.unhandled, [], "the rejection must be handled");
});

test("a refused copy is reported", () => {
  const result = refusedCopy("current");
  assert.strictEqual(result.consoleErrors.length, 1);
  assert.match(result.consoleErrors[0], /clipboard/i);
});

test("a refused copy does not claim to have copied", () => {
  const result = refusedCopy("current");
  assert.strictEqual(result.buttonClass, "code-copy-btn", "no copied class");
  assert.strictEqual(result.buttonLabel, "Copy");
  assert.deepStrictEqual(result.clipboardWrites, []);
});

/* -- Rebuilding ------------------------------------------------------------ */

test("buttons do not pile up when a second document is opened", () => {
  const app = load();
  app.render(FENCED);
  assert.strictEqual(app.mdBody.querySelectorAll(".code-copy-btn").length, 1);
  app.render(FENCED);
  assert.strictEqual(app.mdBody.querySelectorAll(".code-copy-btn").length, 1);
});

test("a document with no code has no buttons", () => {
  const app = withCode("# Just words\n");
  assert.strictEqual(app.mdBody.querySelectorAll(".code-copy-btn").length, 0);
});
