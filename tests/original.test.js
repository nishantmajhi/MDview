/*
 * What the original did.
 *
 * Every test here loads `index.html` as it was at the baseline commit, runs it
 * through the same harness as the fixed page, and asserts that it is broken in
 * the specific way the corresponding fix addresses. They are the other half of
 * the suite: without them, a test that passes against the fixed page might
 * have passed against the original too and be proving nothing at all.
 *
 * The baseline is looked up by commit subject rather than by hash, so a rebase
 * makes these skip loudly instead of quietly asserting nothing.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { loadOriginal, baselineHtml, BASELINE_SUBJECT } = require("./harness.js");

const available = baselineHtml() !== null;
const options = available
  ? {}
  : { skip: 'no commit with the subject "' + BASELINE_SUBJECT + '" touching index.html' };

test("the baseline is reachable", options, () => {
  assert.ok(baselineHtml().includes("marked.parse"), "that does not look like the original file");
});

/* -- The critical one ------------------------------------------------------ */

test("the original loaded no sanitiser at all", options, () => {
  const app = loadOriginal();
  assert.strictEqual(app.hasSanitiser, false);
  assert.strictEqual(app.sanitiserCalls.length, 0);
});

test("the original put an event handler attribute straight into the page", options, () => {
  const app = loadOriginal();
  app.render('# t\n\n<img src="x" onerror="alert(1)">\n');
  const img = app.mdBody.querySelector("img");
  assert.ok(img, "the image element reached the document");
  assert.strictEqual(
    img.getAttribute("onerror"),
    "alert(1)",
    "and it kept the handler that makes it run",
  );
});

test("the original kept a javascript: link", options, () => {
  const app = loadOriginal();
  app.render("[go](javascript:alert(1))\n");
  assert.strictEqual(
    app.mdBody.querySelector("a").getAttribute("href"),
    "javascript:alert(1)",
  );
});

test("the original kept a script element from the document", options, () => {
  const app = loadOriginal();
  app.render("# t\n\n<script>alert(1)<\/script>\n");
  assert.strictEqual(
    app.mdBody.querySelectorAll("script").length,
    1,
    "innerHTML does not execute it, but it is in the tree and a later move would",
  );
});

test("the original loaded its library over the network", options, () => {
  assert.match(baselineHtml(), /src="https:\/\/cdnjs\.cloudflare\.com\//);
});

/* -- Heading identifiers --------------------------------------------------- */

test("the original gave every non-Latin heading the same empty id", options, () => {
  const app = loadOriginal();
  app.render("# नमस्ते\n\n## 概要\n\n## Привет\n");
  assert.deepStrictEqual(
    app.headingIds(),
    ["h-", "h-", "h-"],
    "three headings, one id between them",
  );
});

test("the original deleted accents from Latin headings", options, () => {
  const app = loadOriginal();
  app.render("# Café résumé\n");
  assert.deepStrictEqual(app.headingIds(), ["h-caf-rsum"]);
});

test("the original gave repeated headings the same id", options, () => {
  const app = loadOriginal();
  app.render("# Notes\n\n## Notes\n");
  assert.deepStrictEqual(app.headingIds(), ["h-notes", "h-notes"]);
});

test("so every contents entry for a repeat pointed at the first heading", options, () => {
  const app = loadOriginal();
  app.render("# Notes\n\n## Notes\n\n## Notes\n");
  const hrefs = app.tocEntries().map(e => e.href);
  assert.deepStrictEqual(hrefs, ["#h-notes", "#h-notes", "#h-notes"]);

  const first = app.mdBody.querySelectorAll("h1,h2")[0];
  for (const href of hrefs) {
    assert.strictEqual(
      app.document.getElementById(href.slice(1)),
      first,
      "all three resolved to the first heading",
    );
  }
});

/* -- The contents ---------------------------------------------------------- */

test("the original left raw HTML headings out of the contents", options, () => {
  const app = loadOriginal();
  app.render("# Real\n\n<h2>Raw HTML heading</h2>\n\n## Also real\n");
  assert.strictEqual(
    app.mdBody.querySelectorAll("h2").length,
    2,
    "both level-two headings are on the page",
  );
  assert.deepStrictEqual(
    app.tocEntries().map(e => e.text),
    ["Real", "Also real"],
    "but only one of them is in the contents",
  );
});

test("the original built contents labels as markup", options, () => {
  const app = loadOriginal();
  app.render("# a &lt;b&gt; c\n");
  /* The label was inserted with innerHTML after a tag-stripping regex, so the
   * entities were decoded a second time on the way in. */
  assert.strictEqual(app.tocEntries()[0].text, "a <b> c");
  assert.match(app.tocLinks.innerHTML, /onclick="closeToc\(\)"/);
});

/* -- The copy buttons ------------------------------------------------------ */

test("the original copied its own button label out of a raw pre", options, async () => {
  const app = loadOriginal();
  app.render("<pre>raw block text</pre>\n");
  app.click(app.mdBody.querySelector(".code-copy-btn"));
  await Promise.resolve();
  assert.deepStrictEqual(
    app.clipboard.writes,
    ["raw block text\nCopy"],
    "the button is a child of the block, so its label was part of the text",
  );
});

test("the original let a stale timer cut a confirmation short", options, async () => {
  const app = loadOriginal();
  app.render("```js\nconst a = 1;\n```\n");
  const btn = app.mdBody.querySelector(".code-copy-btn");

  app.click(btn);
  await Promise.resolve();
  app.clock.tick(1500);
  app.click(btn);
  await Promise.resolve();
  app.clock.tick(500);

  assert.ok(
    !btn.classList.contains("copied"),
    "the first click's timer cleared the second click's confirmation half a second in",
  );
});

/*
 * Run in a process of its own -- see the header of `tests/rejection.js` for
 * why the test runner cannot observe this in-process.
 */
test("the original left a refused copy as an unhandled rejection", options, () => {
  const result = JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(__dirname, "rejection.js"), "original"],
      { encoding: "utf8" },
    ),
  );
  assert.strictEqual(result.unhandled.length, 1, "exactly the rejection nobody caught");
  assert.match(result.unhandled[0], /Document is not focused/);
  assert.deepStrictEqual(result.consoleErrors, [], "and nothing said about it either");
});

/* -- Links ----------------------------------------------------------------- */

test("the original threw on a malformed percent escape in an anchor", options, () => {
  const app = loadOriginal();
  app.render("[bad](#%)\n\n# Target\n");
  const link = app.mdBody.querySelector("a");
  assert.throws(() => app.click(link), { name: "URIError" });
});

/* -- Reading a file -------------------------------------------------------- */

test("the original said nothing when a file could not be read", options, () => {
  const app = loadOriginal();
  app.choose("gone.md", null, { failWith: "NotReadableError" });
  assert.strictEqual(app.landing.style.display, "", "still on the landing page");
  assert.deepStrictEqual(app.consoleErrors, [], "and not a word about it anywhere");
});

/* -- Task lists ------------------------------------------------------------ */

/*
 * marked already puts the checkbox in a task item's text. The renderer
 * override added a second one, so every task-list item on every document ever
 * opened in this viewer rendered with two boxes side by side. It is the one
 * defect in this pass that was visible on the screen the whole time.
 */
test("the original drew two checkboxes for every task-list item", options, () => {
  const app = loadOriginal();
  app.render("- [x] done\n- [ ] not done\n");
  assert.strictEqual(app.mdBody.querySelectorAll("input").length, 4, "two items, four boxes");
  for (const item of app.mdBody.querySelectorAll("li")) {
    assert.strictEqual(item.querySelectorAll("input").length, 2);
  }
});

test("the duplicate checkbox is the only difference in a task list", options, () => {
  const { load } = require("./harness.js");
  const markdown = "- [x] done\n- [ ] not done\n";
  const before = loadOriginal();
  const after = load();
  before.render(markdown);
  after.render(markdown);

  assert.strictEqual(after.mdBody.querySelectorAll("input").length, 2);
  assert.strictEqual(
    after.mdBody.querySelector("ul").getAttribute("class"),
    before.mdBody.querySelector("ul").getAttribute("class"),
  );
  assert.deepStrictEqual(
    after.mdBody.querySelectorAll("li").map(li => li.getAttribute("class")),
    before.mdBody.querySelectorAll("li").map(li => li.getAttribute("class")),
  );
  /* Removing the extra input removes the space that separated the two boxes,
   * so the comparison is of words rather than of whitespace. */
  const words = s => s.replace(/\s+/g, " ").trim();
  assert.strictEqual(words(after.mdBody.textContent), words(before.mdBody.textContent));

  /* The box that survives is the one marked built, with its state intact. */
  const boxes = after.mdBody.querySelectorAll("input");
  assert.strictEqual(boxes[0].getAttribute("type"), "checkbox");
  assert.ok(boxes[0].hasAttribute("checked"));
  assert.ok(boxes[0].hasAttribute("disabled"));
  assert.ok(!boxes[1].hasAttribute("checked"));
  assert.ok(boxes[1].hasAttribute("disabled"));
});

/* -- What did not change --------------------------------------------------- */

/*
 * The other side of the pass: everything the original got right, pinned so the
 * rewrite cannot quietly change it. The markdown below deliberately leaves out
 * task lists, which are the one construct whose output is meant to differ; the
 * two tests above cover that difference on its own.
 */
test("the original and the current file agree on ordinary rendering", options, () => {
  const { load } = require("./harness.js");
  const markdown = [
    "# Title",
    "",
    "A paragraph with *emphasis*, **strong** and `code`.",
    "",
    "| a | b |",
    "| - | - |",
    "| 1 | 2 |",
    "",
    "- one",
    "- two",
    "",
    "5. five",
    "6. six",
    "",
    "> a quote",
    "",
    "```js",
    "const a = 1;",
    "```",
    "",
    "[out](https://example.invalid/)",
    "",
  ].join("\n");

  const before = loadOriginal();
  const after = load();
  before.render(markdown);
  after.render(markdown);

  const shape = app =>
    app.mdBody.querySelectorAll("*")
      .filter(el => el.getAttribute("class") !== "code-copy-btn")
      .filter(el => !el.closest(".code-copy-btn"))
      .map(el => el.tagName + (el.getAttribute("class") ? "." + el.getAttribute("class") : ""));

  assert.deepStrictEqual(shape(after), shape(before));
  assert.strictEqual(after.mdBody.textContent.replace(/Copy/g, ""),
    before.mdBody.textContent.replace(/Copy/g, ""));
});
