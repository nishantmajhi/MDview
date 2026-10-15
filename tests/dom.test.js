/*
 * The DOM shim's own tests.
 *
 * `tests/dom.js` came from `Browser Extensions/stealthwriter-sessions`, where
 * it is already covered by a suite of its own. What is tested here is the six
 * things added for this project, because a shim that is wrong about the
 * behaviour a bug depends on hides that bug behind a passing test -- and every
 * one of these six exists because a bug depends on it.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { HtmlDocument, DomEvent } = require("./dom.js");

const doc = (markup) => new HtmlDocument("<html><head></head><body>" + markup + "</body></html>");

/* -- classList.toggle(name, force) ----------------------------------------- */

test("toggle with no second argument flips, as it always did", () => {
  const el = doc("<div></div>").querySelector("div");
  assert.strictEqual(el.classList.toggle("x"), true);
  assert.ok(el.classList.contains("x"));
  assert.strictEqual(el.classList.toggle("x"), false);
  assert.ok(!el.classList.contains("x"));
});

test("toggle with true sets and keeps setting", () => {
  const el = doc("<div></div>").querySelector("div");
  el.classList.toggle("x", true);
  el.classList.toggle("x", true);
  assert.strictEqual(el.getAttribute("class"), "x", "a second true must not remove it");
});

test("toggle with false removes and keeps it removed", () => {
  const el = doc('<div class="x"></div>').querySelector("div");
  el.classList.toggle("x", false);
  el.classList.toggle("x", false);
  assert.ok(!el.classList.contains("x"));
});

test("toggle leaves other classes alone", () => {
  const el = doc('<div class="a b"></div>').querySelector("div");
  el.classList.toggle("b", false);
  el.classList.toggle("c", true);
  assert.deepStrictEqual(el.getAttribute("class").split(" ").sort(), ["a", "c"]);
});

/* -- style ----------------------------------------------------------------- */

test("style is read from the markup", () => {
  const el = doc('<span style="visibility: hidden; color: red"></span>').querySelector("span");
  assert.strictEqual(el.style.visibility, "hidden");
  assert.strictEqual(el.style.color, "red");
});

test("a hyphenated property is reachable by its camel-case name", () => {
  const el = doc('<span style="font-size: 12px"></span>').querySelector("span");
  assert.strictEqual(el.style.fontSize, "12px");
});

test("assigning the empty string removes the declaration", () => {
  const el = doc('<span style="visibility: hidden; color: red"></span>').querySelector("span");
  el.style.visibility = "";
  assert.strictEqual(el.style.visibility, "");
  assert.strictEqual(el.getAttribute("style"), "color: red");
});

test("clearing the last declaration removes the attribute", () => {
  const el = doc('<span style="visibility: hidden"></span>').querySelector("span");
  el.style.visibility = "";
  assert.strictEqual(el.getAttribute("style"), null);
});

test("a property that was never set reads as the empty string", () => {
  const el = doc("<span></span>").querySelector("span");
  assert.strictEqual(el.style.display, "");
});

test("setting a property writes it back to the attribute", () => {
  const el = doc("<span></span>").querySelector("span");
  el.style.display = "none";
  assert.strictEqual(el.getAttribute("style"), "display: none");
});

/* -- innerText ------------------------------------------------------------- */

test("innerText includes a child the markup did not have", () => {
  const document = doc("<pre><code>x = 1</code></pre>");
  const pre = document.querySelector("pre");
  assert.strictEqual(pre.innerText, "x = 1");

  const button = document.createElement("button");
  button.textContent = "Copy";
  pre.appendChild(button);
  assert.strictEqual(
    pre.innerText,
    "x = 1\nCopy",
    "this is the whole copy-button bug: the label is part of the block's text",
  );
});

test("a pre keeps the newline that is in its text but not the one layout added", () => {
  const document = doc("<pre><code>a\nb\n</code></pre>");
  const pre = document.querySelector("pre");
  assert.strictEqual(pre.innerText, "a\nb\n", "the trailing newline is text and stays");

  const button = document.createElement("button");
  button.textContent = "Copy";
  pre.appendChild(button);
  assert.strictEqual(
    pre.innerText,
    "a\nb\n\nCopy",
    "the button contributes its own break on top of the newline already in the text",
  );
});

test("innerText of the code element alone excludes the button", () => {
  const document = doc("<pre><code>x = 1</code></pre>");
  const pre = document.querySelector("pre");
  const button = document.createElement("button");
  button.textContent = "Copy";
  pre.appendChild(button);
  assert.strictEqual(pre.querySelector("code").innerText, "x = 1");
});

test("block elements break lines and inline ones do not", () => {
  const el = doc("<div><p>one</p><p>two</p><span>a</span><span>b</span></div>").querySelector("div");
  assert.strictEqual(el.innerText, "one\ntwo\nab");
});

test("innerText of an empty element is empty", () => {
  assert.strictEqual(doc("<div></div>").querySelector("div").innerText, "");
});

/* -- getBoundingClientRect and scrollIntoView ------------------------------ */

test("a rectangle starts at zero and a test can move it", () => {
  const el = doc("<h2></h2>").querySelector("h2");
  assert.strictEqual(el.getBoundingClientRect().top, 0);
  el.rect.top = -120;
  assert.strictEqual(el.getBoundingClientRect().top, -120);
});

test("scrollIntoView records what it was asked for", () => {
  const el = doc("<h2></h2>").querySelector("h2");
  assert.deepStrictEqual(el.scrolledIntoView, []);
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  assert.deepStrictEqual(el.scrolledIntoView, [{ behavior: "smooth", block: "start" }]);
});

/* -- Bubbling as far as the document --------------------------------------- */

test("an event fired at an element reaches a document listener", () => {
  const document = doc("<div><p>x</p></div>");
  const seen = [];
  document.addEventListener("drop", e => seen.push(e.type));
  document.querySelector("p").dispatchEvent(new DomEvent("drop", { bubbles: true }));
  assert.deepStrictEqual(seen, ["drop"]);
});

test("an event that does not bubble stops where it was fired", () => {
  const document = doc("<div><p>x</p></div>");
  const seen = [];
  document.addEventListener("change", () => seen.push("document"));
  document.querySelector("p").dispatchEvent(new DomEvent("change", { bubbles: false }));
  assert.deepStrictEqual(seen, []);
});

test("preventDefault set by a document listener is visible to the caller", () => {
  const document = doc("<div><p>x</p></div>");
  document.addEventListener("drop", e => e.preventDefault());
  const event = new DomEvent("drop", { bubbles: true });
  document.querySelector("p").dispatchEvent(event);
  assert.ok(event.defaultPrevented);
});

test("the original target survives the bubble", () => {
  const document = doc("<div><p>x</p></div>");
  const p = document.querySelector("p");
  let target = null;
  document.addEventListener("drop", e => { target = e.target; });
  p.dispatchEvent(new DomEvent("drop", { bubbles: true }));
  assert.strictEqual(target, p);
});

/* -- cloneNode ------------------------------------------------------------- */

test("a deep clone copies attributes and children without sharing them", () => {
  const document = doc('<pre class="a"><code>x</code></pre>');
  const pre = document.querySelector("pre");
  const copy = pre.cloneNode(true);
  assert.strictEqual(copy.getAttribute("class"), "a");
  assert.strictEqual(copy.innerText, "x");
  copy.querySelector("code").textContent = "changed";
  assert.strictEqual(pre.innerText, "x", "the clone must be independent");
});

test("a shallow clone takes no children", () => {
  const pre = doc("<pre><code>x</code></pre>").querySelector("pre");
  assert.strictEqual(pre.cloneNode(false).childNodes.length, 0);
});
