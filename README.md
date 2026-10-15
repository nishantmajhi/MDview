# MDview

A markdown viewer that is one HTML file. Open `index.html` in a browser, drop a
`.md` file on it, and read it with the typography and the layout GitHub uses.

There is no build step, no server, no install and no network. Double-clicking
the file is the whole of the setup.

## What it does

- Renders GitHub-flavoured markdown: tables, fenced code, task lists,
  blockquotes, footnote-style links.
- Light and dark, following whatever the system is set to.
- Builds a table of contents from the document's headings, reachable from the
  **Contents** button once there are more than two of them.
- Puts a **Copy** button on every code block.
- Resolves in-document `[text](#anchor)` links, including anchors written for
  GitHub, which are not spelled the same way as this viewer's own.
- Takes a file by drag-and-drop or through the file picker.

It does not edit, save, print, or remember anything. It reads.

## Using it

Open `index.html`. Drop a file on the window, or press **Choose .md file**.

`FORTRAN_Guide_for_Students.md` is in the repository as something to open: it
is a real document of about 70 kB with 114 headings, 91 code blocks and 13
tables in it, which exercises rather more of the renderer than a short sample
would.

## What is in here

```
index.html                       the entire application: markup, styles, script
vendor/marked-9.1.6.min.js       the markdown parser
vendor/purify-3.4.15.min.js      the HTML sanitiser
FORTRAN_Guide_for_Students.md    a document to open
tests/                           the test suite
```

### Why the libraries are files rather than a CDN link

They used to be fetched from cdnjs at load time, which cost three things: the
viewer did not work without a network, a file substituted at the CDN would have
executed with the page's privileges, and a version could not be checked here.

Each file in `vendor/` was fetched from cdnjs and, separately, extracted from
the package npm publishes, and the two were byte-identical. `tests/vendor.test.js`
holds the digest of each and checks it, so a file that changes fails a test.

## Safety

**A markdown file is not trusted input, and this viewer treats it that way.**

Markdown deliberately permits raw HTML, so anything in a document you open —
`<script>`, an `onerror` attribute, a `javascript:` link — is markup somebody
else wrote, and rendering it into a page runs it in that page's origin. The
realistic case is not an attacker singling you out; it is opening a file
somebody emailed you or that came out of a repository.

So everything marked produces goes through DOMPurify before it reaches the
document, restricted to the HTML profile: SVG and MathML are allowed by default
and are where mutation-XSS lives, and a markdown viewer has no use for either.

If the sanitiser is not there, the viewer renders **nothing** and says why.
Failing closed is the point — a fallback to unsanitised markup would defeat the
control entirely.

`<form>` survives sanitising, because DOMPurify's HTML profile allows it. It
cannot act — no event handlers, no `javascript:` action, and DOM clobbering is
blocked — but a document can draw something that looks like a login box. If
that matters for your use, add `form` to `FORBID_TAGS` in `sanitise()`.

## Tests

```sh
npm test
```

That runs two suites and needs no `npm install`, because there are no
dependencies.

**`node --test "tests/*.test.js"`** — 155 checks. The real `index.html` is
loaded into a `node:vm` context against a DOM written for it, and the real
script runs, inline `onclick` handlers included. `tests/original.test.js` runs
the same harness against the file as it was at the first commit and asserts it
is broken in each of the ways this code is not, so no test can pass for a
reason that was already true.

**`node tests/browser/run.js`** — 18 checks in headless Chrome, with the real
marked and the real DOMPurify. The Node suite stubs the sanitiser, because a
DOM faithful enough to run DOMPurify would be a larger and less trustworthy
thing than DOMPurify; it proves only that everything is routed through it.
This is where the payloads are actually fired at a real browser and found not
to run. It skips, rather than failing, if no Chrome or Edge is installed —
set `MDVIEW_BROWSER` to point at one.

`npm run test:baseline` runs those same 18 checks against the first commit. It
expects 14 of them to fail, and says so by name.

## Licence

Free for personal, non-commercial use. You may use, study and modify this
software for yourself, but you may not use it commercially, and you may not
share or publish it, in its original form or modified. See [LICENSE](LICENSE)
for the full terms.

The vendored libraries keep their own: marked is MIT, DOMPurify is
Apache-2.0 / MPL-2.0, and both licence headers are intact in the files.
Nothing here is affiliated with GitHub; the styling merely follows their
published markdown appearance.
