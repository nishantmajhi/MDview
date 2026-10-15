/*
 * Rendering, and the one thing that must be true of every byte of it: nothing
 * reaches the page without going through the sanitiser first.
 *
 * These tests make no claim about what sanitising *does* -- the stub in
 * `harness.js` returns its input unchanged on purpose, so a page that called
 * it and then ignored the result would still fail here, and a page that never
 * called it cannot pass. What actually happens to a payload is proved against
 * the real library in `tests/browser.test.js`.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness.js");

/* -- The pipeline ---------------------------------------------------------- */

test("the page loads a sanitiser at all", () => {
  const app = load();
  assert.ok(app.hasSanitiser, "index.html must include a DOMPurify script tag");
});

test("rendered markdown goes through the sanitiser", () => {
  const app = load();
  app.render("# Title\n\nSome *text*.\n");
  assert.strictEqual(app.sanitiserCalls.length, 1, "expected exactly one sanitise call");
  assert.match(app.sanitiserCalls[0].dirty, /<h1[^>]*>Title<\/h1>/);
});

test("the string handed to the sanitiser is the string that reaches the page", () => {
  const app = load();
  app.render("# Title\n\n<img src=x onerror=alert(1)>\n");
  const call = app.sanitiserCalls.at(-1);
  /* The stub is a pass-through, so anything the page did to the markup after
   * sanitising -- or instead of it -- shows up as a difference here. */
  assert.ok(
    app.mdBody.innerHTML.includes("onerror"),
    "the pass-through stub should have let the payload through, proving this test can fail",
  );
  assert.ok(
    call.dirty.includes("onerror"),
    "the payload must have been offered to the sanitiser, not routed round it",
  );
});

test("every render calls the sanitiser exactly once", () => {
  const app = load();
  app.render("# One\n");
  app.render("# Two\n");
  app.render("# Three\n");
  assert.strictEqual(app.sanitiserCalls.length, 3);
});

test("an empty document still goes through the sanitiser", () => {
  const app = load();
  app.render("");
  assert.strictEqual(app.sanitiserCalls.length, 1);
  assert.strictEqual(app.mdBody.innerHTML, "");
});

test("the sanitiser is asked for the HTML profile", () => {
  const app = load();
  app.render("# Title\n");
  const config = app.sanitiserCalls[0].config;
  assert.ok(config, "sanitize() should be called with an explicit configuration");
  /* The config object is built in the other realm, so it is compared field by
   * field rather than with deepStrictEqual, which rejects a foreign prototype. */
  assert.ok(config.USE_PROFILES, "expected a USE_PROFILES option");
  assert.strictEqual(config.USE_PROFILES.html, true);
  assert.deepStrictEqual(
    Object.keys(config.USE_PROFILES),
    ["html"],
    "SVG and MathML are where mXSS lives and a markdown viewer does not need them",
  );
});

/*
 * Fail closed. If the sanitiser is missing the page must render nothing at
 * all rather than falling back to raw markup, and it must say why.
 */
test("a missing sanitiser refuses to render rather than rendering unsanitised", () => {
  const app = load();
  app.context.DOMPurify = undefined;
  assert.throws(
    () => app.render("# Title\n\n<img src=x onerror=alert(1)>\n"),
    /sanitiser/i,
    "renderFile should refuse when DOMPurify is absent",
  );
  assert.strictEqual(app.mdBody.innerHTML, "", "nothing may reach the page");
});

test("a sanitiser that reports it is unsupported is treated as missing", () => {
  const app = load();
  app.context.DOMPurify = { isSupported: false, sanitize: s => s };
  assert.throws(() => app.render("# Title\n"), /sanitiser/i);
  assert.strictEqual(app.mdBody.innerHTML, "");
});

/* -- Markdown features the styles depend on -------------------------------- */

test("GitHub-flavoured tables render", () => {
  const app = load();
  app.render("| a | b |\n| - | - |\n| 1 | 2 |\n");
  assert.strictEqual(app.mdBody.querySelectorAll("table").length, 1);
  assert.strictEqual(app.mdBody.querySelectorAll("th").length, 2);
  assert.strictEqual(app.mdBody.querySelectorAll("td").length, 2);
});

test("a fenced code block becomes pre > code", () => {
  const app = load();
  app.render("```js\nconst a = 1;\n```\n");
  const pre = app.mdBody.querySelector("pre");
  assert.ok(pre, "expected a <pre>");
  assert.ok(pre.querySelector("code"), "expected a <code> inside it");
  assert.match(pre.querySelector("code").textContent, /const a = 1;/);
});

test("a task list gets the classes the styles hang off", () => {
  const app = load();
  app.render("- [x] done\n- [ ] not done\n");
  const list = app.mdBody.querySelector("ul");
  assert.strictEqual(list.getAttribute("class"), "task-list");
  const items = app.mdBody.querySelectorAll("li");
  assert.strictEqual(items.length, 2);
  for (const item of items) assert.strictEqual(item.getAttribute("class"), "task-list-item");
  const boxes = app.mdBody.querySelectorAll("input");
  assert.strictEqual(boxes.length, 2);
  assert.strictEqual(boxes[0].hasAttribute("checked"), true);
  assert.strictEqual(boxes[1].hasAttribute("checked"), false);
  for (const box of boxes) assert.strictEqual(box.hasAttribute("disabled"), true);
});

test("a plain list is not given the task-list class", () => {
  const app = load();
  app.render("- one\n- two\n");
  assert.strictEqual(app.mdBody.querySelector("ul").getAttribute("class"), null);
});

test("an ordered list that does not start at one keeps its start attribute", () => {
  const app = load();
  app.render("5. five\n6. six\n");
  assert.strictEqual(app.mdBody.querySelector("ol").getAttribute("start"), "5");
});

test("an ordered list starting at one has no start attribute", () => {
  const app = load();
  app.render("1. one\n2. two\n");
  assert.strictEqual(app.mdBody.querySelector("ol").getAttribute("start"), null);
});

test("a single newline is not a line break, because breaks is off", () => {
  const app = load();
  app.render("one\ntwo\n");
  assert.strictEqual(app.mdBody.querySelectorAll("br").length, 0);
});

/* -- What the rest of the chrome does on render ---------------------------- */

test("rendering reveals the filename and the open button and hides the landing page", () => {
  const app = load();
  assert.strictEqual(app.filenameEl.style.visibility, "hidden", "precondition");
  assert.strictEqual(app.openBtn.style.visibility, "hidden", "precondition");

  app.render("# Title\n", "notes.md");

  assert.strictEqual(app.filenameEl.textContent, "notes.md");
  assert.strictEqual(app.filenameEl.style.visibility, "");
  assert.strictEqual(app.openBtn.style.visibility, "");
  assert.strictEqual(app.landing.style.display, "none");
  assert.strictEqual(app.content.style.display, "block");
  assert.strictEqual(app.document.title, "notes.md - MDview");
});

test("rendering scrolls back to the top", () => {
  const app = load();
  app.render("# Title\n");
  assert.deepStrictEqual(app.scrolls.at(-1), { top: 0 });
});

test("the filename is set as text, not as markup", () => {
  const app = load();
  app.render("# Title\n", "<img src=x onerror=alert(1)>.md");
  assert.strictEqual(app.filenameEl.querySelectorAll("img").length, 0);
  assert.strictEqual(app.filenameEl.textContent, "<img src=x onerror=alert(1)>.md");
});
