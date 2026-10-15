/*
 * The table of contents.
 *
 * It is built from the rendered document rather than from the markdown, which
 * is the whole reason it is correct: a heading is a heading whether marked
 * produced it or the document wrote it as raw HTML, and whatever the sanitiser
 * decided to keep is what the reader can actually see and click through to.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness.js");

function toc(markdown) {
  const app = load();
  app.render(markdown);
  return { app, entries: app.tocEntries() };
}

test("headings become contents entries in document order", () => {
  const { entries } = toc("# One\n\n## Two\n\n### Three\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["One", "Two", "Three"]);
});

test("each entry links to the id of its heading", () => {
  const { app, entries } = toc("# One\n\n## Two\n\n### Three\n");
  const ids = app.headingIds();
  assert.deepStrictEqual(entries.map(e => e.href), ids.map(id => "#" + id));
});

test("every contents link resolves to a heading that exists", () => {
  const { app, entries } = toc("# One\n\n## Two\n\n## Two\n\n### नमस्ते\n");
  for (const entry of entries) {
    const target = app.document.getElementById(entry.href.slice(1));
    assert.ok(target, "no element with id " + entry.href);
    assert.match(target.tagName, /^h[1-6]$/);
  }
});

/*
 * Two headings with the same words used to produce two entries pointing at the
 * same id, so the second one scrolled to the first one.
 */
test("repeated headings link to different places", () => {
  const { entries } = toc("# Notes\n\n## Notes\n\n## Notes\n");
  const hrefs = entries.map(e => e.href);
  assert.strictEqual(new Set(hrefs).size, 3, "expected three distinct targets: " + JSON.stringify(hrefs));
});

test("headings in a non-Latin script link to different places", () => {
  const { entries } = toc("# नमस्ते\n\n## 概要\n\n## Привет\n");
  const hrefs = entries.map(e => e.href);
  assert.strictEqual(new Set(hrefs).size, 3, "expected three distinct targets: " + JSON.stringify(hrefs));
});

test("a heading written as raw HTML appears in the contents", () => {
  const { entries } = toc("# Real\n\n<h2>Raw HTML heading</h2>\n\n## Also real\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["Real", "Raw HTML heading", "Also real"]);
});

/* -- Depth ---------------------------------------------------------------- */

test("headings deeper than level three are left out", () => {
  const { entries } = toc("# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["One", "Two", "Three"]);
});

test("an entry carries the class for its level", () => {
  const { entries } = toc("# One\n\n## Two\n\n### Three\n");
  assert.deepStrictEqual(
    entries.map(e => e.el.getAttribute("class")),
    ["toc-h1", "toc-h2", "toc-h3"],
  );
});

/* -- The button ------------------------------------------------------------ */

test("the contents button appears once there are more than two entries", () => {
  const { app } = toc("# One\n\n## Two\n\n## Three\n");
  assert.ok(app.tocBtn.classList.contains("visible"));
});

test("the contents button stays hidden for two headings or fewer", () => {
  const { app } = toc("# One\n\n## Two\n");
  assert.ok(!app.tocBtn.classList.contains("visible"));
});

test("the contents button is withdrawn when a later document has few headings", () => {
  const app = load();
  app.render("# One\n\n## Two\n\n## Three\n");
  assert.ok(app.tocBtn.classList.contains("visible"), "precondition");
  app.render("# Only one\n");
  assert.ok(!app.tocBtn.classList.contains("visible"), "the button must not survive the document");
});

test("a document with no headings leaves an empty contents list", () => {
  const { app, entries } = toc("Just a paragraph.\n");
  assert.deepStrictEqual(entries, []);
  assert.strictEqual(app.tocLinks.innerHTML, "");
  assert.ok(!app.tocBtn.classList.contains("visible"));
});

test("the contents does not accumulate across documents", () => {
  const app = load();
  app.render("# One\n\n## Two\n\n## Three\n");
  assert.strictEqual(app.tocEntries().length, 3);
  app.render("# Fresh\n\n## Start\n");
  assert.deepStrictEqual(app.tocEntries().map(e => e.text), ["Fresh", "Start"]);
});

/* -- Heading text is text -------------------------------------------------- */

/*
 * Contents labels are set as text, never as markup. The original built them by
 * concatenating HTML and stripping tags with a regular expression, which is a
 * shape that only stays safe for as long as nobody changes what feeds it.
 */
test("an entry shows the heading's words, with its formatting flattened", () => {
  const { entries } = toc("# The `code` and **bold** bit\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["The code and bold bit"]);
});

test("an entry label cannot introduce an element", () => {
  const { app, entries } = toc('# a <img src=x alt=">" onerror=alert(1)> b\n');
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(
    app.tocLinks.querySelectorAll("*").length,
    entries.length,
    "the contents may contain nothing but its own anchors",
  );
});

test("an ampersand in a heading is shown, not decoded twice", () => {
  const { entries } = toc("# Tips & tricks\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["Tips & tricks"]);
});

test("a less-than sign written as an entity stays a character", () => {
  const { app, entries } = toc("# a &lt;b&gt; c\n");
  assert.deepStrictEqual(entries.map(e => e.text), ["a <b> c"]);
  assert.strictEqual(app.tocLinks.querySelectorAll("b").length, 0);
});

/* -- Opening and closing --------------------------------------------------- */

test("the contents button opens the drawer", () => {
  const { app } = toc("# One\n\n## Two\n\n## Three\n");
  assert.ok(!app.tocOverlay.classList.contains("open"), "precondition");
  app.click(app.tocBtn);
  assert.ok(app.tocOverlay.classList.contains("open"));
});

test("clicking an entry closes the drawer", () => {
  const { app, entries } = toc("# One\n\n## Two\n\n## Three\n");
  app.click(app.tocBtn);
  assert.ok(app.tocOverlay.classList.contains("open"), "precondition");
  app.click(entries[1].el);
  assert.ok(!app.tocOverlay.classList.contains("open"));
});

test("the close button closes the drawer", () => {
  const { app } = toc("# One\n\n## Two\n\n## Three\n");
  app.click(app.tocBtn);
  app.click(app.$("toc-close"));
  assert.ok(!app.tocOverlay.classList.contains("open"));
});

test("clicking the backdrop closes the drawer but clicking inside it does not", () => {
  const { app } = toc("# One\n\n## Two\n\n## Three\n");
  app.click(app.tocBtn);
  app.click(app.$("toc-drawer"));
  assert.ok(app.tocOverlay.classList.contains("open"), "a click inside the drawer must not close it");
  app.click(app.tocOverlay);
  assert.ok(!app.tocOverlay.classList.contains("open"));
});
