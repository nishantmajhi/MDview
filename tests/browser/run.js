/*
 * Runs the real page in a real browser.
 *
 * The Node suite stubs DOMPurify, because a DOM faithful enough to run the
 * real sanitiser would be a bigger and less trustworthy thing than the
 * sanitiser itself. That leaves one question open -- do the payloads actually
 * die? -- and this is where it is answered: headless Chrome, the real marked,
 * the real DOMPurify, the real `index.html`.
 *
 * It also re-checks the two browser behaviours the Node harness only models:
 * what `innerText` does inside a `<pre>` that has a button in it, and that the
 * page's own script tags load from disk.
 *
 * Chrome is driven with `--headless=new --dump-dom`, which needs no driver, no
 * protocol client and no dependency. The page is copied to a scratch directory
 * with one extra line appended -- a script tag for `driver.js` -- and the copy
 * is checked against the real file byte for byte up to that line, so a page
 * that drifted from the one under test fails loudly.
 *
 * With no browser installed this exits 0 and says SKIP. Everything it covers
 * that can be covered without one is covered by the Node suite as well; what
 * is lost in a skip is the sanitiser's actual effect.
 */

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..", "..");

const CANDIDATES = [
  process.env.MDVIEW_BROWSER,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

function findBrowser() {
  for (const candidate of CANDIDATES) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      /* not there */
    }
  }
  return null;
}

const APPENDED = '\n<script src="driver.js"></script>\n';

const BASELINE_SUBJECT = "Initial commit";

/*
 * `--original` stages the baseline commit's `index.html` instead of the
 * current one, so the same checks can be run against the code as it was. It
 * exists to answer the question the suite is otherwise assuming the answer to:
 * would any of this have failed before the fix? It should report eight
 * failures, and `--original` exits 0 when it does.
 *
 * Its one concession is the script tag: the baseline fetches marked from
 * cdnjs, and that is rewritten to the vendored copy, which is byte-identical
 * to what cdnjs serves. Without it the run would depend on a network and on
 * whatever the CDN returned that day.
 */
function baselineHtml() {
  const sha = execFileSync(
    "git",
    ["log", "--format=%H", "--grep=^" + BASELINE_SUBJECT + "$", "--max-count=1", "--", "index.html"],
    { cwd: ROOT, encoding: "utf8" },
  ).trim().split("\n")[0];
  if (!sha) throw new Error("no baseline commit found");
  return execFileSync("git", ["show", sha + ":index.html"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  }).replace(
    /src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/marked\/9\.1\.6\/marked\.min\.js"/,
    'src="vendor/marked-9.1.6.min.js"',
  );
}

function stage(useBaseline) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mdview-browser-"));
  const original = useBaseline
    ? baselineHtml()
    : fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  fs.mkdirSync(path.join(dir, "vendor"));
  for (const file of fs.readdirSync(path.join(ROOT, "vendor"))) {
    fs.copyFileSync(path.join(ROOT, "vendor", file), path.join(dir, "vendor", file));
  }
  fs.copyFileSync(path.join(__dirname, "driver.js"), path.join(dir, "driver.js"));
  fs.writeFileSync(path.join(dir, "index.html"), original + APPENDED, "utf8");

  /* The page under test must be the page it claims to be. */
  const staged = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  if (staged.slice(0, original.length) !== original || staged.slice(original.length) !== APPENDED) {
    throw new Error("the staged copy is not the page plus exactly one script tag");
  }
  return dir;
}

function run(browser, dir) {
  const profile = path.join(dir, "profile");
  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-first-run",
      "--disable-extensions",
      "--user-data-dir=" + profile,
      "--virtual-time-budget=15000",
      "--dump-dom",
      "file:///" + path.join(dir, "index.html").replace(/\\/g, "/"),
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 120000 },
  );

  if (result.error) throw result.error;
  const dom = result.stdout || "";
  const match = dom.match(/<div id="test-results">([\s\S]*?)<\/div>/);
  if (!match) {
    throw new Error(
      "the page produced no results. Last of the dumped DOM:\n" + dom.slice(-1500) +
        "\n--- stderr ---\n" + (result.stderr || "").slice(-1500),
    );
  }
  const decoded = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return JSON.parse(decoded);
}

/*
 * Three facts about `innerText` that `tests/dom.js` models. They are asserted
 * here against the browser itself, because a model that had drifted from the
 * real thing would let the copy-button tests pass while the button copied
 * something else.
 */
function checkInnerTextModel(detail) {
  const expected = {
    fencedCode: "const a = 1;\n",
    fencedPre: "const a = 1;\n\nCopy",
    rawPre: "raw block text\nCopy",
  };
  const wrong = Object.keys(expected).filter(key => detail[key] !== expected[key]);
  if (wrong.length) {
    const lines = wrong.map(
      key => "    " + key + ": expected " + JSON.stringify(expected[key]) +
        ", browser gave " + JSON.stringify(detail[key]),
    );
    return "tests/dom.js models innerText differently from this browser:\n" + lines.join("\n");
  }
  return null;
}

/*
 * What the baseline is expected to fail. Naming them rather than counting them
 * means a run against the original that starts passing something -- or that
 * fails for a new reason -- is visible instead of being absorbed into a total.
 */
const EXPECTED_BASELINE_FAILURES = [
  "no event-handler attribute survives",
  "no javascript: URL survives",
  "no script element survives",
  "no iframe, object or embed survives",
  "nothing from the document executed",
  "clicking a surviving link runs nothing",
  "the sanitiser is the real one",
  "every heading has a distinct id",
  "a Devanagari heading keeps its letters in its id",
  "the contents lists every heading, raw HTML included",
  "every contents link resolves to a different heading",
  "each task-list item has exactly one checkbox",
  /* The baseline gives repeated headings one id between them, so the link to
   * the second one resolves to nothing and the handler declines it. */
  "a hash link scrolls rather than navigating",
  "with no sanitiser the page renders nothing and says why",
];

function reportBaseline(results) {
  const failed = results.filter(r => !r.ok).map(r => r.name).sort();
  const expected = [...EXPECTED_BASELINE_FAILURES].sort();

  for (const result of results) {
    const shouldFail = EXPECTED_BASELINE_FAILURES.includes(result.name);
    const surprising = result.ok === shouldFail;
    console.log(
      (result.ok ? "  ok        " : "  as before ") + result.name +
        (surprising ? "   <-- not what the baseline was expected to do" : ""),
    );
  }

  console.log("");
  if (JSON.stringify(failed) !== JSON.stringify(expected)) {
    console.log("the baseline did not fail the checks it was expected to fail.");
    console.log("  expected: " + JSON.stringify(expected, null, 2));
    console.log("  actual:   " + JSON.stringify(failed, null, 2));
    return 1;
  }
  console.log(
    results.length + " checks against the baseline, " + failed.length +
      " failed, which is exactly the set this pass set out to fix.",
  );
  return 0;
}

function main() {
  const useBaseline = process.argv.includes("--original");
  const browser = findBrowser();
  if (!browser) {
    console.log("SKIP: no Chrome or Edge found.");
    console.log("      Set MDVIEW_BROWSER to one to run the browser half of the suite.");
    console.log("      Everything it covers except the sanitiser's actual effect is");
    console.log("      covered by the Node suite as well.");
    return 0;
  }

  console.log("browser: " + browser);
  console.log("page:    " + (useBaseline ? "the baseline commit" : "index.html"));
  let dir;
  try {
    dir = stage(useBaseline);
    const results = run(browser, dir);

    if (useBaseline) return reportBaseline(results);

    let failed = 0;
    for (const result of results) {
      if (result.ok) {
        console.log("  ok   " + result.name);
        if (result.name.startsWith("innerText behaves")) {
          const problem = checkInnerTextModel(result.detail);
          if (problem) {
            failed += 1;
            console.log("  FAIL " + result.name);
            console.log(problem);
          }
        }
      } else {
        failed += 1;
        console.log("  FAIL " + result.name);
        console.log("       " + String(result.error).split("\n").join("\n       "));
      }
    }

    console.log("");
    console.log(results.length + " checks, " + failed + " failed");
    return failed === 0 ? 0 : 1;
  } catch (err) {
    console.log("FAIL: " + (err && err.message ? err.message : err));
    return 1;
  } finally {
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
}

process.exit(main());
