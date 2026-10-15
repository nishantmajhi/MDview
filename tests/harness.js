/*
 * Loads the real `index.html` and runs the real script in it.
 *
 * MDview has no seam at all. It is one file: the markup, the styles and the
 * whole application in a single inline <script> that runs at load time against
 * `document`. There is nothing to require, no function to call and no module
 * boundary anywhere, so the only way to test the real code is to give it a
 * document and let it load. That is what this is for.
 *
 * It is deliberately the same shape as
 * `Web/Frontend/With Libraries/docxDiff/tests/harness.js` -- read the real
 * file, run it in a `node:vm` context -- but it does not strip an IIFE
 * wrapper, because this script has none, and it has to stand up rather more of
 * a browser: a file picker, a drop target, a clipboard, a clock and the
 * markdown library itself.
 *
 * -- What is real and what is not -------------------------------------------
 *
 * Real: `index.html` byte for byte, including the inline handlers in the
 * markup; `marked` 9.1.6, the actual minified build the page ships; the DOM,
 * as far as `tests/dom.js` goes.
 *
 * Not real: `DOMPurify`. It needs a genuine browser DOM -- `createHTMLDocument`,
 * a node iterator, a template element, namespace-aware attributes -- and a
 * shim faithful enough to run it would be a larger and less trustworthy thing
 * than the sanitiser itself. So the stub here **records its input and returns
 * it unchanged**, and the tests on this side of the suite assert only that
 * every string which reaches the page went through it. They make no claim
 * about what sanitising does.
 *
 * Whether the payloads actually die is proved in `tests/browser/run.js`, which
 * loads this same file in headless Chrome with the real library. That split is
 * on purpose: a stub that pretended to sanitise would make the routing tests
 * pass against a page that never called it, which is precisely the defect they
 * exist to catch.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const { HtmlDocument, DomEvent, Element } = require("./dom.js");

const ROOT = path.join(__dirname, "..");

/*
 * The baseline loads marked from cdnjs. Tests must not depend on a network,
 * and a test that fetched the script would be asserting against whatever cdnjs
 * served today rather than against the pinned version. `vendor/` holds the same
 * file -- byte-identical to both the cdnjs copy and the npm-published release,
 * which `vendor.test.js` checks -- so the two are interchangeable and the
 * original and the fixed page run against exactly the same library.
 */
const CDN_ALIASES = [
  [/marked.*\.js$/i, "vendor/marked-9.1.6.min.js"],
  [/purify.*\.js$/i, "vendor/purify-3.4.15.min.js"],
];

function resolveScriptSrc(src) {
  if (!/^https?:/i.test(src)) return path.join(ROOT, src);
  for (const [pattern, local] of CDN_ALIASES) {
    if (pattern.test(src)) return path.join(ROOT, local);
  }
  throw new Error("unknown external script: " + src);
}

/* -- A clock the tests drive ---------------------------------------------- */

function makeClock() {
  let now = 0;
  let seq = 0;
  const timers = new Map();

  return {
    setTimeout(fn, delay) {
      const id = ++seq;
      timers.set(id, { fn, at: now + (Number(delay) || 0), seq });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    get pending() { return timers.size; },
    get now() { return now; },
    /* Runs every timer due within `ms`, in the order a browser would. */
    tick(ms) {
      const target = now + (Number(ms) || 0);
      for (;;) {
        const due = [...timers.entries()]
          .filter(([, t]) => t.at <= target)
          .sort((a, b) => a[1].at - b[1].at || a[1].seq - b[1].seq);
        if (!due.length) break;
        const [id, timer] = due[0];
        timers.delete(id);
        now = Math.max(now, timer.at);
        timer.fn();
      }
      now = target;
    },
  };
}

/* -- Files ----------------------------------------------------------------- */

class FakeFile {
  constructor(name, text, options) {
    this.name = name;
    this.text = text;
    this.size = Buffer.byteLength(text === null || text === undefined ? "" : String(text), "utf8");
    this.failWith = (options || {}).failWith || null;
  }
}

/*
 * A FileReader that fails the way a real one does: `onerror` with an error on
 * the reader, not a thrown exception. A shim that only ever succeeded would
 * make "what happens when the file cannot be read" untestable, and the answer
 * on the baseline turns out to be "nothing at all, silently".
 */
function makeFileReader(clock) {
  return class FileReader {
    constructor() {
      this.onload = null;
      this.onerror = null;
      this.result = null;
      this.error = null;
    }
    readAsText(file) {
      clock.setTimeout(() => {
        if (file && file.failWith) {
          this.error = { name: file.failWith };
          if (this.onerror) this.onerror({ target: this });
          return;
        }
        /* A real reader sniffs and removes a UTF-8 byte-order mark. */
        const text = file ? file.text : null;
        this.result = typeof text === "string" ? text.replace(/^﻿/, "") : text;
        if (this.onload) this.onload({ target: this });
      }, 0);
    }
  };
}

/* -- Inline handlers in the markup ----------------------------------------- */

/*
 * `onclick="openToc()"` appears in `index.html` several times and is how three
 * of the buttons work. The attribute is a script in the page's own scope, so it
 * is compiled in the page's context -- which means a handler naming a function
 * that no longer exists fails a test here instead of failing silently in a
 * browser nobody opened.
 */
function wireInlineHandlers(document, context, compiled) {
  const walk = element => {
    for (const child of element.children) {
      for (const name of Object.keys(child.attributes)) {
        if (!name.startsWith("on")) continue;
        const source = child.getAttribute(name);
        if (compiled.get(child) === source) continue;
        compiled.set(child, source);
        child.addEventListener(name.slice(2), function (event) {
          const fn = vm.runInContext(
            "(function(event){ " + source + " })",
            context,
            { filename: "index.html " + child.tagName + "[" + name + "]" },
          );
          fn.call(child, event);
        });
      }
      walk(child);
    }
  };
  walk(document.documentElement);
}

/* -- Load ------------------------------------------------------------------ */

function load(options) {
  const opts = options || {};
  const html = opts.html !== undefined
    ? opts.html
    : fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  const document = new HtmlDocument(html);
  const clock = makeClock();

  const clipboard = { writes: [], rejectWith: null };
  const scrolls = [];
  const consoleErrors = [];
  const sanitiserCalls = [];
  const historyCalls = [];

  const navigator = {
    clipboard: {
      writeText(text) {
        if (clipboard.rejectWith) return Promise.reject(new Error(clipboard.rejectWith));
        clipboard.writes.push(String(text));
        return Promise.resolve();
      },
    },
  };

  const location = { hash: "", href: "file:///index.html" };
  const history = {
    /* A browser throws here on a file:// origin and the page has a fallback for
     * exactly that, so tests can turn it on. */
    throwOnPushState: false,
    pushState(state, title, url) {
      if (history.throwOnPushState) throw new Error("pushState on a file: origin");
      historyCalls.push(url);
      location.hash = String(url);
    },
  };

  const context = vm.createContext({});
  const window = context;

  Object.assign(context, {
    window,
    globalThis: context,
    self: context,
    document,
    navigator,
    location,
    history,
    console: {
      log() {},
      warn() {},
      error(...args) { consoleErrors.push(args.map(String).join(" ")); },
    },
    setTimeout: (fn, ms) => clock.setTimeout(fn, ms),
    clearTimeout: id => clock.clearTimeout(id),
    setInterval: (fn, ms) => clock.setTimeout(fn, ms),
    clearInterval: id => clock.clearTimeout(id),
    queueMicrotask: fn => Promise.resolve().then(fn),
    scrollY: 0,
    /* The options object comes from the other realm, so it is copied into a
     * plain one here -- otherwise `assert.deepStrictEqual` rejects a value
     * that is structurally identical because its prototype is not this one. */
    scrollTo(...args) {
      scrolls.push(args.length === 1 ? Object.assign({}, args[0]) : { top: args[1] });
    },
    /* `window.addEventListener("scroll", ...)` and the document's listener
     * table are the same table here, which is close enough: nothing in this
     * page registers the same event on both. */
    addEventListener(type, fn) { document.addEventListener(type, fn); },
    removeEventListener(type, fn) { document.removeEventListener(type, fn); },
    Event: DomEvent,
    Element,
    FileReader: makeFileReader(clock),
    File: FakeFile,
    Promise,
    TextEncoder,
    TextDecoder,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    JSON,
    Math,
    Date,
    RegExp,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Error,
    TypeError,
    URIError,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Symbol,
    Proxy,
    Reflect,
    isNaN,
    isFinite,
    parseInt,
    parseFloat,
  });

  /* Load every <script src> the markup lists, in the order it lists them. */
  let sawSanitiser = false;
  for (const tag of document.querySelectorAll("script[src]")) {
    const src = tag.getAttribute("src");
    if (/purify/i.test(src)) { sawSanitiser = true; continue; /* stubbed -- see header */ }
    vm.runInContext(fs.readFileSync(resolveScriptSrc(src), "utf8"), context, { filename: src });
  }

  if (sawSanitiser) {
    context.DOMPurify = {
      version: "stub",
      isSupported: true,
      sanitize(dirty, config) {
        sanitiserCalls.push({ dirty: String(dirty), config: config || null });
        return String(dirty);
      },
    };
  }

  /* The application itself: every inline <script>, in order. */
  const inline = document.querySelectorAll("script").filter(tag => !tag.hasAttribute("src"));
  for (const tag of inline) {
    vm.runInContext(tag.textContent, context, { filename: "index.html" });
  }

  const compiledHandlers = new WeakMap();
  wireInlineHandlers(document, context, compiledHandlers);

  const $ = id => document.getElementById(id);

  const api = {
    context,
    window,
    document,
    clock,
    clipboard,
    scrolls,
    consoleErrors,
    history,
    historyCalls,
    location,
    sanitiserCalls,
    hasSanitiser: sawSanitiser,
    inlineScriptCount: inline.length,
    $,

    get mdBody() { return $("md-body"); },
    get tocLinks() { return $("toc-links"); },
    get tocBtn() { return $("toc-btn"); },
    get tocOverlay() { return $("toc-overlay"); },
    get landing() { return $("landing"); },
    get content() { return $("content"); },
    get filenameEl() { return $("filename"); },
    get openBtn() { return $("open-btn"); },
    get upBtn() { return $("up-btn"); },

    /* Re-run the inline-handler wiring after the page rebuilds markup. */
    rewire() { wireInlineHandlers(document, context, compiledHandlers); },

    /* Choose a file through the real <input type=file>. */
    choose(name, text, options) {
      const input = $("file-input");
      input.files = [new FakeFile(name, text, options)];
      const event = new DomEvent("change", { bubbles: false });
      event.target = input;
      input.dispatchEvent(event);
      clock.tick(0);
      api.rewire();
    },

    /* Drop a file on the page: the other half of the entry point. */
    drop(name, text, options) {
      const event = new DomEvent("drop", { bubbles: true });
      event.dataTransfer = { files: name === null ? [] : [new FakeFile(name, text, options)] };
      document.body.dispatchEvent(event);
      clock.tick(0);
      api.rewire();
      return event;
    },

    /* Render without an input, for tests that are about rendering. */
    render(text, name) {
      context.renderFile(text, name === undefined ? "doc.md" : name);
      api.rewire();
    },

    click(element) {
      const event = new DomEvent("click", { bubbles: true });
      element.dispatchEvent(event);
      return event;
    },

    scroll(y) {
      context.scrollY = y;
      document.dispatch("scroll");
    },

    tocEntries() {
      return api.tocLinks.querySelectorAll("a").map(a => ({
        href: a.getAttribute("href"),
        text: a.textContent,
        html: a.innerHTML,
        el: a,
      }));
    },

    headingIds() {
      return api.mdBody
        .querySelectorAll("h1,h2,h3,h4,h5,h6")
        .map(h => h.getAttribute("id"));
    },
  };

  return api;
}

/*
 * The baseline, read out of git by commit subject rather than by hash, so a
 * rebase makes these tests skip loudly instead of quietly asserting nothing.
 * This is `Python/library_system/tests/original.py`'s trick, and it works here
 * for the same reason: the original is a file, not a module with side effects.
 */
const BASELINE_SUBJECT = "Initial commit";

let baselineCache;
function baselineHtml() {
  if (baselineCache !== undefined) return baselineCache;
  try {
    const sha = execFileSync(
      "git",
      ["log", "--format=%H", "--grep=^" + BASELINE_SUBJECT + "$", "--max-count=1", "--", "index.html"],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim().split("\n")[0];
    baselineCache = sha
      ? execFileSync("git", ["show", sha + ":index.html"], {
          cwd: ROOT,
          encoding: "utf8",
          maxBuffer: 8 * 1024 * 1024,
          stdio: ["ignore", "pipe", "ignore"],
        })
      : null;
  } catch {
    baselineCache = null;
  }
  return baselineCache;
}

function loadOriginal() {
  const html = baselineHtml();
  return html === null ? null : load({ html });
}

module.exports = { load, loadOriginal, baselineHtml, BASELINE_SUBJECT, FakeFile, ROOT };
