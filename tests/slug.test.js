/*
 * Heading identifiers.
 *
 * Every heading gets an `id`, and three separate things depend on it being
 * unique and stable: the table of contents links to it, an in-document
 * `[text](#anchor)` link resolves to it, and the scroll handler decides which
 * contents entry to highlight by looking it up. An id that collides does not
 * fail visibly -- `getElementById` simply returns the first match -- so every
 * link to the second heading silently goes to the first one instead.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness.js");

function idsFor(markdown) {
  const app = load();
  app.render(markdown);
  return app.headingIds();
}

test("a plain heading gets a slug of its text", () => {
  assert.deepStrictEqual(idsFor("# Hello World\n"), ["h-hello-world"]);
});

test("markdown punctuation is dropped from the slug", () => {
  assert.deepStrictEqual(idsFor("# The `code` and **bold** bit\n"), ["h-the-code-and-bold-bit"]);
});

test("runs of whitespace collapse to a single hyphen", () => {
  assert.deepStrictEqual(idsFor("# One   Two\tThree\n"), ["h-one-two-three"]);
});

test("punctuation that is not a word character is dropped", () => {
  assert.deepStrictEqual(idsFor("# What's new? (2026)\n"), ["h-whats-new-2026"]);
});

/*
 * The original stripped everything outside `[^\w-]`, and `\w` without the `u`
 * flag is `[A-Za-z0-9_]`. A heading in any non-Latin script therefore produced
 * an empty slug and the bare id `h-`, so every such heading in a document
 * shared one id and the contents entries for all of them jumped to the first.
 */
test("a Devanagari heading keeps its letters", () => {
  assert.deepStrictEqual(idsFor("# नमस्ते\n"), ["h-नमस्ते"]);
});

test("a CJK heading keeps its letters", () => {
  assert.deepStrictEqual(idsFor("# 概要\n"), ["h-概要"]);
});

test("accented Latin letters survive instead of being deleted", () => {
  assert.deepStrictEqual(idsFor("# Café résumé\n"), ["h-café-résumé"]);
});

test("Cyrillic and Greek headings do not collide with each other", () => {
  const ids = idsFor("# Привет\n\n## Γεια\n");
  assert.strictEqual(new Set(ids).size, 2, "expected two distinct ids, got " + JSON.stringify(ids));
  assert.ok(!ids.includes("h-"), "no heading should collapse to the bare prefix");
});

test("digits in other scripts are kept", () => {
  assert.deepStrictEqual(idsFor("# ١٢٣\n"), ["h-١٢٣"]);
});

/* -- Uniqueness ----------------------------------------------------------- */

test("two headings with the same text get different ids", () => {
  assert.deepStrictEqual(idsFor("# Notes\n\n## Notes\n"), ["h-notes", "h-notes-1"]);
});

test("a third repeat keeps counting", () => {
  assert.deepStrictEqual(
    idsFor("# Notes\n\n## Notes\n\n### Notes\n"),
    ["h-notes", "h-notes-1", "h-notes-2"],
  );
});

test("headings that differ only in punctuation still get different ids", () => {
  const ids = idsFor("# Set up\n\n## Set-up\n");
  assert.strictEqual(new Set(ids).size, 2, "expected two distinct ids, got " + JSON.stringify(ids));
});

test("a heading with no slug-able characters still gets a usable id", () => {
  const ids = idsFor("# ---\n\n## !!!\n");
  assert.strictEqual(new Set(ids).size, 2, "expected two distinct ids, got " + JSON.stringify(ids));
  for (const id of ids) {
    assert.ok(id && id !== "h-", "id should not be the bare prefix: " + JSON.stringify(id));
  }
});

test("every id is a legal HTML identifier with no whitespace", () => {
  const ids = idsFor(
    "# A B\n\n## नमस्ते दुनिया\n\n### x y z\n",
  );
  for (const id of ids) {
    assert.ok(id.length > 0, "empty id");
    assert.ok(!/\s/.test(id), "id contains whitespace: " + JSON.stringify(id));
    assert.ok(!/["'<>]/.test(id), "id contains markup punctuation: " + JSON.stringify(id));
  }
});

/* -- Headings the renderer never saw --------------------------------------- */

/*
 * Markdown permits raw HTML, so `<h2>Title</h2>` is a heading on the page that
 * the markdown renderer never produced. Assigning ids from the rendered DOM
 * rather than from the renderer is what makes these reachable at all.
 */
test("a heading written as raw HTML gets an id too", () => {
  const ids = idsFor("# Real\n\n<h2>Raw HTML heading</h2>\n");
  assert.strictEqual(ids.length, 2);
  assert.deepStrictEqual(ids, ["h-real", "h-raw-html-heading"]);
});

test("a raw HTML heading that already carries an id keeps it", () => {
  const app = load();
  app.render('# Real\n\n<h2 id="keep-me">Kept</h2>\n');
  assert.deepStrictEqual(app.headingIds(), ["h-real", "keep-me"]);
});

test("ids do not leak between documents", () => {
  const app = load();
  app.render("# Notes\n");
  assert.deepStrictEqual(app.headingIds(), ["h-notes"]);
  app.render("# Notes\n");
  assert.deepStrictEqual(app.headingIds(), ["h-notes"], "the counter must reset per document");
});
