/*
 * Runs inside the real page, in a real browser.
 *
 * `tests/browser/run.js` copies `index.html` and `vendor/` into a scratch
 * directory, appends one script tag pointing at this file, and loads the
 * result in headless Chrome. Everything here therefore runs against the real
 * markup, the real marked and the real DOMPurify -- which is the point, since
 * the Node suite stubs the sanitiser and deliberately makes no claim about
 * what it does.
 *
 * Results go into a <div id="test-results"> as JSON, which the runner reads
 * out of the dumped DOM.
 */

(function () {
  "use strict";

  const results = [];
  const check = (name, fn) => {
    try {
      const detail = fn();
      results.push({ name, ok: true, detail: detail === undefined ? null : detail });
    } catch (err) {
      results.push({ name, ok: false, error: String((err && err.stack) || err) });
    }
  };

  const assert = (condition, message) => {
    if (!condition) throw new Error(message || "assertion failed");
  };
  const equal = (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(
        (message ? message + ": " : "") +
          "expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual),
      );
    }
  };

  const body = () => document.getElementById("md-body");

  /* Open a document the way a person does: drop it on the page. */
  function openMarkdown(text, name) {
    return new Promise((resolve, reject) => {
      const file = new File([text], name || "test.md", { type: "text/markdown" });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const event = new DragEvent("drop", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "dataTransfer", { value: transfer });
      document.dispatchEvent(event);
      /* FileReader is asynchronous; wait for the document to change. */
      let waited = 0;
      const poll = () => {
        if (document.title.indexOf(file.name) === 0) return resolve();
        waited += 20;
        if (waited > 4000) return reject(new Error("the document never rendered"));
        setTimeout(poll, 20);
      };
      poll();
    });
  }

  /* -- The security checks ------------------------------------------------- */

  async function securityChecks() {
    const payload = [
      "# Heading",
      "",
      '<img src="does-not-exist.png" onerror="window.__ran_onerror = true">',
      "",
      "[js link](javascript:window.__ran_href = true)",
      "",
      '<a href="#x" onclick="window.__ran_onclick = true">inline onclick</a>',
      "",
      "<script>window.__ran_script = true;<\/script>",
      "",
      '<iframe src="javascript:window.__ran_iframe = true"></iframe>',
      "",
      '<svg><script>window.__ran_svg = true;<\/script></svg>',
      "",
      '<form action="x"><input name="y"></form>',
      "",
      '<object data="x"></object><embed src="x">',
      "",
      "<details open><summary>kept</summary>body</details>",
      "",
    ].join("\n");

    await openMarkdown(payload, "payload.md");

    check("no event-handler attribute survives", () => {
      const withHandlers = [...body().querySelectorAll("*")].filter(el =>
        [...el.attributes].some(a => /^on/i.test(a.name)),
      );
      equal(withHandlers.map(el => el.outerHTML).join(" | "), "", "elements kept a handler");
    });

    check("no javascript: URL survives", () => {
      const urls = [...body().querySelectorAll("[href],[src],[action],[data]")]
        .map(el => el.getAttribute("href") || el.getAttribute("src") ||
                   el.getAttribute("action") || el.getAttribute("data"))
        .filter(u => u && /^\s*javascript:/i.test(u));
      equal(urls.join(" | "), "", "a javascript: URL reached the document");
    });

    check("no script element survives", () => {
      equal(body().querySelectorAll("script").length, 0);
    });

    check("no iframe, object or embed survives", () => {
      equal(body().querySelectorAll("iframe,object,embed").length, 0);
    });

    /*
     * DOMPurify's HTML profile keeps <form>, and this records that rather than
     * asserting it away: a markdown document can therefore draw something that
     * looks like a login box. What it cannot do is make it act -- no handler,
     * no javascript: action, and DOM clobbering is blocked -- so the form can
     * only submit somewhere, the way a link can only link somewhere. It is
     * noted in review.md as a decision for the author, not treated as a bug.
     */
    check("a form survives but is inert", () => {
      const form = body().querySelector("form");
      assert(form, "DOMPurify's html profile is expected to keep <form>");
      equal(form.getAttribute("onsubmit"), null);
      assert(
        !/^\s*javascript:/i.test(form.getAttribute("action") || ""),
        "a javascript: action survived",
      );
    });

    /*
     * The one that matters most: an onerror handler is not merely absent from
     * the markup, nothing actually ran. The image points at a file that is not
     * there, so a surviving handler fires -- but not instantly, because the
     * load has to be attempted and fail first. Waiting is what makes this
     * check mean anything: without it the baseline passes it, which is how
     * the wait came to be here.
     */
    await new Promise(resolve => setTimeout(resolve, 1500));

    check("nothing from the document executed", () => {
      equal(!!window.__ran_onerror, false, "an onerror handler ran");
      equal(!!window.__ran_script, false, "a script element ran");
      equal(!!window.__ran_iframe, false, "an iframe ran");
      equal(!!window.__ran_svg, false, "an svg script ran");
    });

    check("clicking a surviving link runs nothing", () => {
      for (const a of body().querySelectorAll("a")) a.click();
      equal(!!window.__ran_href, false, "a javascript: href ran on click");
      equal(!!window.__ran_onclick, false, "an inline onclick ran");
    });

    check("harmless raw HTML is kept", () => {
      const details = body().querySelector("details");
      assert(details, "a <details> block should survive sanitising");
      assert(details.querySelector("summary"), "and keep its <summary>");
    });

    check("the sanitiser is the real one", () => {
      /* The UMD build exports a callable factory, so this is a function. */
      assert(typeof DOMPurify === "function", "DOMPurify did not load");
      assert(typeof DOMPurify.sanitize === "function", "DOMPurify.sanitize is missing");
      equal(DOMPurify.version, "3.4.15");
      equal(DOMPurify.isSupported, true);
    });

    check("the page loaded its libraries from disk, not a network", () => {
      const srcs = [...document.querySelectorAll("script[src]")].map(s => s.getAttribute("src"));
      for (const src of srcs) {
        assert(!/^(https?:)?\/\//.test(src), "external script: " + src);
      }
      assert(typeof marked === "object" || typeof marked === "function", "marked did not load");
    });
  }

  /* -- The things the Node suite models rather than runs -------------------- */

  async function behaviourChecks() {
    await openMarkdown(
      [
        "# Notes",
        "",
        "## Notes",
        "",
        "## नमस्ते",
        "",
        "<h3>Raw HTML heading</h3>",
        "",
        "- [x] done",
        "- [ ] not done",
        "",
        "```js",
        "const a = 1;",
        "```",
        "",
        "<pre>raw block text</pre>",
        "",
        "[to the second](#notes-1)",
        "",
      ].join("\n"),
      "behaviour.md",
    );

    check("every heading has a distinct id", () => {
      const ids = [...body().querySelectorAll("h1,h2,h3")].map(h => h.id);
      equal(ids.length, 4);
      equal(new Set(ids).size, 4, "duplicate ids: " + JSON.stringify(ids));
      for (const id of ids) assert(id && id !== "h-", "empty id: " + JSON.stringify(id));
      return ids;
    });

    check("a Devanagari heading keeps its letters in its id", () => {
      const heading = [...body().querySelectorAll("h2")].find(h => h.textContent === "नमस्ते");
      assert(heading, "the heading is on the page");
      equal(heading.id, "h-नमस्ते");
    });

    check("the contents lists every heading, raw HTML included", () => {
      const labels = [...document.querySelectorAll("#toc-links a")].map(a => a.textContent);
      equal(JSON.stringify(labels), JSON.stringify(["Notes", "Notes", "नमस्ते", "Raw HTML heading"]));
    });

    check("every contents link resolves to a different heading", () => {
      const targets = [...document.querySelectorAll("#toc-links a")]
        .map(a => document.getElementById(a.getAttribute("href").slice(1)));
      for (const target of targets) assert(target, "a contents link resolves to nothing");
      equal(new Set(targets).size, targets.length, "two entries share a target");
    });

    check("each task-list item has exactly one checkbox", () => {
      const items = [...body().querySelectorAll("li.task-list-item")];
      equal(items.length, 2);
      for (const item of items) equal(item.querySelectorAll("input").length, 1);
      equal(items[0].querySelector("input").checked, true);
      equal(items[1].querySelector("input").checked, false);
      for (const item of items) equal(item.querySelector("input").disabled, true);
    });

    /*
     * The copy buttons read `innerText`, whose exact behaviour the Node suite
     * models from what a browser does. This is where that model is checked
     * against the browser itself.
     */
    check("innerText behaves the way the Node harness assumes", () => {
      const pres = [...body().querySelectorAll("pre")];
      equal(pres.length, 2);
      const fenced = pres.find(p => p.querySelector("code"));
      const raw = pres.find(p => !p.querySelector("code"));
      assert(fenced && raw, "expected one fenced block and one raw one");
      return {
        fencedCode: fenced.querySelector("code").innerText,
        fencedPre: fenced.innerText,
        rawPre: raw.innerText,
      };
    });

    check("a hash link scrolls rather than navigating", () => {
      const link = [...body().querySelectorAll("a")].find(a => a.textContent === "to the second");
      assert(link, "the link is on the page");
      const before = window.scrollY;
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      equal(event.defaultPrevented, true, "the handler should take over the jump");
      return { scrollYBefore: before };
    });
  }

  /* -- Fail closed ---------------------------------------------------------- */

  function sanitiserMissingCheck() {
    check("with no sanitiser the page renders nothing and says why", () => {
      const saved = window.DOMPurify;
      try {
        window.DOMPurify = undefined;
        body().innerHTML = "<p>left over</p>";
        let message = null;
        try {
          renderFile('# t\n\n<img src=x onerror="window.__failopen = true">\n', "closed.md");
        } catch (err) {
          message = String(err.message || err);
        }
        assert(message, "renderFile should have thrown");
        assert(/sanitiser/i.test(message), "the message should name the sanitiser: " + message);
        equal(body().innerHTML, "<p>left over</p>", "nothing may have been replaced");
        return message;
      } finally {
        window.DOMPurify = saved;
      }
    });
  }

  async function main() {
    try {
      await securityChecks();
      await behaviourChecks();
      sanitiserMissingCheck();
    } catch (err) {
      results.push({ name: "the run itself", ok: false, error: String((err && err.stack) || err) });
    }
    const out = document.createElement("div");
    out.id = "test-results";
    out.textContent = JSON.stringify(results);
    document.body.appendChild(out);
  }

  main();
})();
