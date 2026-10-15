/*
 * Getting a file into the viewer: the picker, the drop target, and what
 * happens when the read does not work.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness.js");
const { DomEvent } = require("./dom.js");

/* -- The file picker ------------------------------------------------------- */

test("choosing a file renders it", () => {
  const app = load();
  app.choose("notes.md", "# Chosen\n");
  assert.strictEqual(app.mdBody.querySelectorAll("h1").length, 1);
  assert.strictEqual(app.mdBody.querySelector("h1").textContent, "Chosen");
  assert.strictEqual(app.filenameEl.textContent, "notes.md");
});

/*
 * The input is cleared after each pick, because a browser fires no `change`
 * event when the same file is chosen twice running and the document would
 * appear not to reload.
 */
test("the same file can be chosen twice running", () => {
  const app = load();
  app.choose("notes.md", "# First\n");
  assert.strictEqual(app.$("file-input").value, "", "the input must be cleared after a pick");
  app.choose("notes.md", "# Second\n");
  assert.strictEqual(app.mdBody.querySelector("h1").textContent, "Second");
});

test("choosing nothing does nothing", () => {
  const app = load();
  const input = app.$("file-input");
  input.files = [];
  const event = new DomEvent("change", { bubbles: false });
  event.target = input;
  assert.doesNotThrow(() => input.dispatchEvent(event));
  assert.strictEqual(app.landing.style.display, "", "the landing page must still be showing");
});

/* -- Drag and drop --------------------------------------------------------- */

test("dropping a file renders it", () => {
  const app = load();
  app.drop("dropped.md", "# Dropped\n");
  assert.strictEqual(app.mdBody.querySelector("h1").textContent, "Dropped");
  assert.strictEqual(app.filenameEl.textContent, "dropped.md");
});

test("a drop is not handed on to the browser", () => {
  const app = load();
  const event = app.drop("dropped.md", "# Dropped\n");
  assert.ok(event.defaultPrevented, "the browser would otherwise navigate to the file");
});

test("dropping something that is not a file does not throw", () => {
  const app = load();
  assert.doesNotThrow(() => app.drop(null));
  assert.strictEqual(app.landing.style.display, "", "the landing page must still be showing");
});

test("the drag-over state goes on and comes off", () => {
  const app = load();
  const body = app.document.body;

  app.document.dispatchEvent(new DomEvent("dragover", { bubbles: false }));
  assert.ok(body.classList.contains("drag-over"));

  app.document.dispatchEvent(new DomEvent("dragleave", { bubbles: false }));
  assert.ok(!body.classList.contains("drag-over"));
});

test("the drag-over state is cleared by the drop itself", () => {
  const app = load();
  app.document.dispatchEvent(new DomEvent("dragenter", { bubbles: false }));
  assert.ok(app.document.body.classList.contains("drag-over"), "precondition");
  app.drop("dropped.md", "# Dropped\n");
  assert.ok(!app.document.body.classList.contains("drag-over"));
});

/* -- When the read fails --------------------------------------------------- */

/*
 * A file can disappear or become unreadable between being chosen and being
 * read. The original had no `onerror`, so the reader failed and the page sat
 * on the landing screen with no indication that anything had been attempted.
 * There is still no message on screen -- that would be a change to the
 * interface -- but the failure is now noticed and reported rather than lost.
 */
test("an unreadable file is reported rather than swallowed", () => {
  const app = load();
  app.choose("gone.md", null, { failWith: "NotReadableError" });
  assert.strictEqual(app.landing.style.display, "", "nothing should have rendered");
  assert.strictEqual(app.consoleErrors.length, 1, "the failure must be reported somewhere");
  assert.match(app.consoleErrors[0], /gone\.md/);
  assert.match(app.consoleErrors[0], /NotReadableError/);
});

test("an unreadable drop is reported too", () => {
  const app = load();
  app.drop("gone.md", null, { failWith: "NotFoundError" });
  assert.strictEqual(app.consoleErrors.length, 1);
  assert.match(app.consoleErrors[0], /NotFoundError/);
});

test("a failed read leaves an already-open document alone", () => {
  const app = load();
  app.choose("good.md", "# Still here\n");
  app.choose("gone.md", null, { failWith: "NotReadableError" });
  assert.strictEqual(
    app.mdBody.querySelector("h1").textContent,
    "Still here",
    "a failed read must not blank the document that was open",
  );
  assert.strictEqual(app.filenameEl.textContent, "good.md");
});

/* -- Odd files ------------------------------------------------------------- */

test("an empty file renders an empty document rather than failing", () => {
  const app = load();
  app.choose("empty.md", "");
  assert.strictEqual(app.mdBody.innerHTML, "");
  assert.strictEqual(app.content.style.display, "block");
  assert.strictEqual(app.filenameEl.textContent, "empty.md");
});

test("a file of only whitespace is fine", () => {
  const app = load();
  assert.doesNotThrow(() => app.choose("blank.md", "\n\n   \n"));
});

test("Windows line endings render the same as Unix ones", () => {
  const unix = load();
  unix.render("# Title\n\nOne\n\n- a\n- b\n");
  const dos = load();
  dos.render("# Title\r\n\r\nOne\r\n\r\n- a\r\n- b\r\n");
  assert.strictEqual(dos.mdBody.innerHTML, unix.mdBody.innerHTML);
});

/*
 * `FileReader.readAsText` sniffs and removes a UTF-8 byte-order mark, so the
 * application never sees one. This is here because it is easy to assume
 * otherwise and add a stripping step that is not needed -- and because the
 * harness's reader has to do the same thing or the assumption is untested.
 */
test("a leading byte-order mark never reaches the renderer", () => {
  const app = load();
  app.choose("bom.md", "﻿# Title\n");
  assert.strictEqual(app.mdBody.querySelectorAll("h1").length, 1);
  assert.strictEqual(app.mdBody.querySelector("h1").textContent, "Title");
});
