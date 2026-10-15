/*
 * "Did a refused clipboard write leave an unhandled promise rejection?"
 *
 * This has to run in a process of its own. `node --test` installs its own
 * `unhandledRejection` handler and attributes anything it catches to the test
 * that was running, so a test which merely listens for the event is failed by
 * the runner before it can assert on it -- and one that does not listen proves
 * nothing, because the runner has already swallowed it.
 *
 * So: load the page, click a copy button with a clipboard that refuses, and
 * print what happened. `copy.test.js` and `original.test.js` run this and read
 * the answer.
 *
 * Usage: node tests/rejection.js current|original
 */

"use strict";

const { load, loadOriginal } = require("./harness.js");

const which = process.argv[2];
const app = which === "original" ? loadOriginal() : load();

if (app === null) {
  process.stdout.write(JSON.stringify({ skipped: "no baseline commit" }));
  process.exit(0);
}

const unhandled = [];
process.on("unhandledRejection", reason => unhandled.push(String(reason)));

app.render("```js\nconst a = 1;\n```\n");
app.clipboard.rejectWith = "Document is not focused";

const btn = app.mdBody.querySelector(".code-copy-btn");
app.click(btn);

/*
 * Node emits `unhandledRejection` once the microtask queue has drained, so one
 * turn of the event loop is enough -- but a timer is used rather than a
 * microtask so that the answer does not depend on how many `.then` links the
 * page happens to have put in the chain.
 */
setTimeout(() => {
  process.stdout.write(
    JSON.stringify({
      unhandled,
      consoleErrors: app.consoleErrors,
      buttonClass: btn.getAttribute("class"),
      buttonLabel: btn.textContent,
      clipboardWrites: app.clipboard.writes,
    }),
  );
}, 20);
