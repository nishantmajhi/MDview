/*
 * In-document links, and the scroll handler that follows them.
 *
 * A markdown document written for GitHub links to its own headings with
 * `[text](#some-heading)`, where the anchor is GitHub's slug and not
 * necessarily this page's id. Resolving that is what `fixHashLinks` is for.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness.js");

function open(markdown) {
  const app = load();
  app.render(markdown);
  return app;
}

function linkTo(app, href) {
  const link = app.mdBody
    .querySelectorAll("a")
    .find(a => a.getAttribute("href") === href);
  assert.ok(link, "no link with href " + JSON.stringify(href));
  return link;
}

test("a link to a heading scrolls to it", () => {
  const app = open("[go](#getting-started)\n\n## Getting Started\n");
  const heading = app.document.getElementById("h-getting-started");
  assert.ok(heading, "precondition: the heading has the expected id");

  const event = app.click(linkTo(app, "#getting-started"));
  assert.strictEqual(heading.scrolledIntoView.length, 1);
  assert.deepStrictEqual(heading.scrolledIntoView[0], { behavior: "smooth", block: "start" });
  assert.ok(event.defaultPrevented, "the browser's own jump must be suppressed");
});

test("a link that already uses this page's id resolves too", () => {
  const app = open("[go](#h-getting-started)\n\n## Getting Started\n");
  const heading = app.document.getElementById("h-getting-started");
  app.click(linkTo(app, "#h-getting-started"));
  assert.strictEqual(heading.scrolledIntoView.length, 1);
});

test("a percent-encoded anchor resolves", () => {
  const app = open("[go](#getting%20started)\n\n## Getting started\n");
  const heading = app.document.getElementById("h-getting-started");
  app.click(linkTo(app, "#getting%20started"));
  assert.strictEqual(heading.scrolledIntoView.length, 1);
});

/*
 * marked percent-encodes a non-ASCII anchor, so the attribute in the document
 * is not the text the author wrote. Decoding it is the first thing the click
 * handler does, and the reason it has to.
 */
test("an anchor in another script resolves", () => {
  const app = open("[go](#नमस्ते)\n\n## नमस्ते\n");
  const heading = app.document.getElementById("h-नमस्ते");
  assert.ok(heading, "precondition: the heading kept its letters");

  const link = app.mdBody.querySelector("a");
  assert.strictEqual(
    link.getAttribute("href"),
    "#%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87",
    "precondition: the anchor really is encoded in the markup",
  );

  app.click(link);
  assert.strictEqual(heading.scrolledIntoView.length, 1);
});

/*
 * `decodeURIComponent("%")` throws. The original called it unguarded inside a
 * click handler, so a document containing `[x](#%)` -- or any stray percent
 * sign in an anchor -- threw a URIError out of the handler on every click.
 */
test("a malformed percent escape does not throw", () => {
  const app = open("[bad](#%)\n\n# Target\n");
  assert.doesNotThrow(() => app.click(linkTo(app, "#%")));
});

test("a malformed escape that still names a heading resolves", () => {
  const app = open("[bad](#100%)\n\n## 100%\n");
  const heading = app.document.getElementById("h-100");
  assert.ok(heading, "precondition");
  assert.doesNotThrow(() => app.click(linkTo(app, "#100%")));
  assert.strictEqual(heading.scrolledIntoView.length, 1);
});

test("a link to nothing is left to the browser", () => {
  const app = open("[nowhere](#no-such-heading)\n\n# Target\n");
  const event = app.click(linkTo(app, "#no-such-heading"));
  assert.ok(!event.defaultPrevented, "an unresolved anchor should behave normally");
});

test("an external link is left alone", () => {
  const app = open("[out](https://example.invalid/)\n\n# Target\n");
  const event = app.click(linkTo(app, "https://example.invalid/"));
  assert.ok(!event.defaultPrevented);
  assert.strictEqual(app.historyCalls.length, 0);
});

/* -- The address bar ------------------------------------------------------- */

test("following a link records the heading's id", () => {
  const app = open("[go](#target)\n\n## Target\n");
  app.click(linkTo(app, "#target"));
  assert.deepStrictEqual(app.historyCalls, ["#h-target"]);
});

/*
 * `history.pushState` throws on a `file:` origin, which is the way this tool is
 * meant to be used, so the fallback is not a nicety.
 */
test("a file:// origin falls back to the location hash", () => {
  const app = open("[go](#target)\n\n## Target\n");
  app.history.throwOnPushState = true;
  assert.doesNotThrow(() => app.click(linkTo(app, "#target")));
  assert.strictEqual(app.location.hash, "h-target");
  assert.strictEqual(
    app.document.getElementById("h-target").scrolledIntoView.length,
    1,
    "the scroll must still have happened",
  );
});

test("links in a second document are wired up too", () => {
  const app = load();
  app.render("[go](#one)\n\n## One\n");
  app.render("[go](#two)\n\n## Two\n");
  const heading = app.document.getElementById("h-two");
  app.click(linkTo(app, "#two"));
  assert.strictEqual(heading.scrolledIntoView.length, 1);
});

/* -- The scroll handler ---------------------------------------------------- */

test("the scroll-to-top button appears past the threshold", () => {
  const app = open("# Title\n");
  assert.ok(!app.upBtn.classList.contains("visible"));
  app.scroll(321);
  assert.ok(app.upBtn.classList.contains("visible"));
  app.scroll(10);
  assert.ok(!app.upBtn.classList.contains("visible"), "and goes away again");
});

test("the scroll-to-top button scrolls to the top", () => {
  const app = open("# Title\n");
  app.click(app.upBtn);
  assert.deepStrictEqual(app.scrolls.at(-1), { top: 0, behavior: "smooth" });
});

test("the contents entry for the heading you are reading is highlighted", () => {
  const app = open("# One\n\n## Two\n\n## Three\n");
  const ids = app.headingIds();
  const rect = id => app.document.getElementById(id).rect;

  /* Two headings are above the fold; the third is still below it. */
  rect(ids[0]).top = -400;
  rect(ids[1]).top = 40;
  rect(ids[2]).top = 600;
  app.scroll(500);

  const active = app.tocEntries().filter(e => e.el.classList.contains("toc-active"));
  assert.strictEqual(active.length, 1, "exactly one entry should be active");
  assert.strictEqual(active[0].href, "#" + ids[1]);
});

test("the highlight moves as you scroll further", () => {
  const app = open("# One\n\n## Two\n\n## Three\n");
  const ids = app.headingIds();
  const rect = id => app.document.getElementById(id).rect;

  rect(ids[0]).top = -900;
  rect(ids[1]).top = -400;
  rect(ids[2]).top = 20;
  app.scroll(1200);

  const active = app.tocEntries().filter(e => e.el.classList.contains("toc-active"));
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].href, "#" + ids[2]);
});

test("scrolling with no contents does nothing and does not throw", () => {
  const app = open("Just a paragraph.\n");
  assert.doesNotThrow(() => app.scroll(900));
});

/*
 * Repeated headings used to give every contents entry after the first the same
 * target, so `getElementById` returned the first heading for all of them and
 * the highlight stuck at the top of the document however far you scrolled.
 */
test("the highlight follows repeated headings to the right one", () => {
  const app = open("# Notes\n\n## Notes\n\n## Notes\n");
  const ids = app.headingIds();
  const rect = id => app.document.getElementById(id).rect;

  rect(ids[0]).top = -900;
  rect(ids[1]).top = -400;
  rect(ids[2]).top = 20;
  app.scroll(1200);

  const active = app.tocEntries().filter(e => e.el.classList.contains("toc-active"));
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].href, "#" + ids[2], "the last heading should be the active one");
});
