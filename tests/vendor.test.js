/*
 * The two libraries the page ships.
 *
 * They used to come from a CDN at load time, which meant three things: the
 * tool did not work without a network, a compromised or substituted file would
 * execute in the page, and nothing about the version could be checked here.
 * They are now files in `vendor/`, and these tests are what keeps that honest.
 *
 * The digests below are not transcribed from a listing. Each file was fetched
 * from cdnjs and, separately, extracted from the package npm publishes, and
 * the two were byte-identical -- so the digest is a fact about two independent
 * copies agreeing, not about one download.
 */

"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const { ROOT } = require("./harness.js");

const EXPECTED = {
  "vendor/marked-9.1.6.min.js":
    "6002af63485b043fa60ddaba1b34363b98d2a8b2c63b607004f3a2405a8a053a",
  "vendor/purify-3.4.15.min.js":
    "f263b05369e050fa175d4ecb9c9358eb4253602d510297adfb31df48b2f1c4d5",
};

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

for (const [file, digest] of Object.entries(EXPECTED)) {
  test(file + " is the published release, unmodified", () => {
    const bytes = fs.readFileSync(path.join(ROOT, file));
    assert.strictEqual(crypto.createHash("sha256").update(bytes).digest("hex"), digest);
  });

  test(file + " is the copy the page loads", () => {
    assert.ok(
      html.includes('src="' + file + '"'),
      "index.html should load " + file + " by that exact path",
    );
  });
}

test("the page loads nothing from the network", () => {
  const external = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)]
    .map(m => m[1])
    .filter(src => /^(https?:)?\/\//.test(src));
  assert.deepStrictEqual(
    external,
    [],
    "a viewer that has to reach a CDN to render a local file is not offline-capable, " +
      "and whatever the CDN serves runs in the page",
  );
});

test("no stylesheet or font is fetched from the network either", () => {
  const links = [...html.matchAll(/<link[^>]*\shref="([^"]+)"/g)].map(m => m[1]);
  for (const href of links) {
    assert.ok(
      !/^(https?:)?\/\//.test(href),
      "external resource in a page meant to work offline: " + href,
    );
  }
});

test("the version of each library is stated in the markup next to it", () => {
  assert.match(html, /marked\s+9\.1\.6/i, "the marked version should be written down");
  assert.match(html, /DOMPurify\s+3\.4\.15/i, "the DOMPurify version should be written down");
});

test("both licences are kept in the vendored files", () => {
  const marked = fs.readFileSync(path.join(ROOT, "vendor/marked-9.1.6.min.js"), "utf8");
  const purify = fs.readFileSync(path.join(ROOT, "vendor/purify-3.4.15.min.js"), "utf8");
  assert.match(marked, /MIT Licensed/i);
  assert.match(purify, /license/i);
});

test("the sanitiser is loaded before the script that uses it", () => {
  const purifyAt = html.indexOf("vendor/purify-3.4.15.min.js");
  const usesAt = html.indexOf("DOMPurify.sanitize");
  assert.ok(purifyAt !== -1 && usesAt !== -1, "precondition");
  assert.ok(purifyAt < usesAt, "a deferred or later script tag would leave the first render unsanitised");
});
