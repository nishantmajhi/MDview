# MDview — review and remediation record

First reviewed 2026-09-04. Remediated 2026-09-19 on `cleanup/2026-09-19`.
Not pushed.

## Corrections to the first review

The first review was right about its headline finding and right about the
shape of the fix. Two things in it need correcting, and one needs extending.

**The one-line fix it proposed was not sufficient.** It suggested

```js
mdBody.innerHTML = DOMPurify.sanitize(marked.parse(text));
```

That closes the body, and the body was the sink it named. But the table of
contents was built from `headings[]`, which the *renderer* filled during
`marked.parse` — before any sanitising — and each label went into
`tocLinks.innerHTML`. Sanitising the body alone would have left a second path
from a document's text to `innerHTML` looking closed when it was not.

To be exact about how bad that second path was, because the temptation is to
overstate it: **no payload could be found that reaches it.** The labels went
through `text.replace(/<[^>]+>/g, "")`, and fourteen attempts to smuggle a `<`
past that regex through marked — quoted attributes containing `>`, nested
tags, unterminated tags, CDATA, processing instructions, `<x<img …>` — all
failed, because marked escapes a `<` it cannot parse as a tag and the regex
consumes whole tags either way. So it was a fragile construction rather than a
live hole. It has been removed anyway: the contents is now built from the
sanitised DOM with `textContent`, which is both safe and, it turns out,
correct in three ways the string version was not.

**"Nothing to remove. No debug output, no secrets, no analytics, no dead
code."** That is true of secrets and analytics. It is not true of dead code:
the `renderer.heading` override existed to build a structure that the contents
then rebuilt from, and the whole `headings` array is gone. There was also a
duplicate `slugify` — the same five lines appeared inline in `renderer.heading`
and again as a named function 170 lines below it.

**It missed the one defect visible on the screen.** Every task-list item
rendered with **two checkboxes**. `renderer.listitem` prepended an
`<input type="checkbox">` to text that marked had already put a checkbox in.
The review read the renderer overrides — item 3 of its findings is about the
lines immediately below them — and did not open a document with a task list in
it. Confirmed in a real Chrome against the original file before it was
touched.

That is this archive's recurring lesson from the other side. `Quadratic
Parser/QIC` had 152 passing tests that never called the solver;
`Python/library_system` had a careful reading that never ran the program. This
was a careful reading that never opened a file.

## What was wrong, and what was done

Eleven defects. The first review found one of them.

### 1. Any markdown file you opened could run code in the page — P1, confirmed

`marked.parse()` went straight to `innerHTML` with no sanitiser. marked does
not sanitise; the option was removed in version 5 and its documentation points
at DOMPurify.

Proved against the original in headless Chrome before anything was changed:
an `<img onerror>` in the document **executed**, an inline `onclick`
**executed**, and a `javascript:` href reached the DOM intact. A `<script>`
element was inserted into the tree — `innerHTML` does not execute one, but it
is live the moment anything moves it.

Fixed: DOMPurify 3.4.15, vendored, with `USE_PROFILES: { html: true }`. The
profile is deliberate — SVG and MathML are allowed by default and are where
mutation-XSS lives, and a markdown viewer needs neither.

The page now **fails closed**: with no sanitiser, `renderFile` throws and
renders nothing rather than falling back to raw markup.

### 2. The contents was a second, unsanitised path to `innerHTML`

Covered above. Rebuilt from the sanitised DOM with `createElement` and
`textContent`.

### 3. Every heading in a non-Latin script got the same identifier

`.replace(/[^\w-]/g, "")` — and `\w` without the `u` flag is `[A-Za-z0-9_]`.
A heading in Devanagari, CJK, Cyrillic or Greek was stripped to nothing and
became the bare id `h-`. Every such heading in a document shared that one id,
so every contents entry for them scrolled to the first, and the reading-position
highlight stuck there whatever you did. Accented Latin lost its accents:
`Café résumé` became `h-caf-rsum`.

Fixed: `[^\p{L}\p{M}\p{N}_-]` with the `u` flag. Marks matter and are easy to
miss — the vowel signs in `नमस्ते` are `\p{M}`, not `\p{L}`, and a class of
letters and digits alone silently changes the word.

### 4. Two headings with the same words got the same identifier

Nothing checked. `getElementById` returns the first match and does not
complain, so a document with two `## Notes` sections had a contents where the
second entry went to the first section.

Fixed: identifiers are assigned in one pass over the rendered document against
a set of the ones already used, appending `-1`, `-2` as GitHub does. Ids the
document's own author wrote are reserved first so a generated one cannot
collide with one further down the page.

### 5. Headings written as raw HTML were missing from the contents

Markdown permits raw HTML, so `<h2>Title</h2>` is a heading on the page that
the renderer never produced. The contents was built from the renderer, so it
listed a document's headings only if marked had made them.

Fixed by the same change as 3 and 4: identifiers and the contents both come
from the rendered DOM, so a heading is a heading however it got there.

### 6. Copying a raw `<pre>` copied the button's own label

The copy button is appended *inside* the `<pre>` — the styles position it
against that block — so once it is there, its label is part of the block's
text. With a `<code>` child the code fell back to that and the bug was hidden;
a `<pre>` written as raw HTML has no `<code>`, and every copy out of one ended
with the word `Copy`. Confirmed in Chrome: `"raw block text\nCopy"`.

Fixed by reading the text *before* the button is appended.

### 7. A second click on a copy button cut its own confirmation short

The 2000 ms reset timer was never cancelled. Click, wait a second and a half,
click again: the first timer fires half a second later and clears the
confirmation the second click had just set.

Fixed with `clearTimeout` on the stored handle.

### 8. A refused clipboard write was an unhandled promise rejection

`navigator.clipboard.writeText(...).then(...)` with no `.catch`. `writeText`
rejects for reasons that have nothing to do with this page — an unfocused
document is the usual one — and the failure surfaced as an unhandled rejection
in the console while the button sat there saying `Copy`.

Fixed with a `.catch` that reports it. The button deliberately still says
`Copy`, which is honest, because nothing was copied. **See "Left alone" below
— this wants a decision.**

### 9. A stray percent sign in an anchor threw on every click

`decodeURIComponent(...)` unguarded inside the click handler. `[x](#100%)` is
an ordinary thing for a document to contain, and `decodeURIComponent("100%")`
throws `URIError`.

Fixed: an anchor that will not decode is used as it stands.

### 10. A file that could not be read failed silently

`FileReader` had an `onload` and no `onerror`. A file deleted, moved or made
unreadable between being chosen and being read produced nothing at all — the
landing page just sat there, with no indication that anything had been
attempted.

Fixed with an `onerror` that reports it. **Also wants a decision — see below.**

### 11. The libraries came from a CDN at load time

The first review's item 1 asked for subresource integrity. That has been
superseded rather than done: both libraries are now files in `vendor/`, which
closes the same hole more completely and fixes two other things with it.

- The viewer now works with no network. It did not before: if the CDN was
  unreachable, `marked` was undefined, the inline script threw at
  `new marked.Renderer()`, and **no listener was ever attached** — so the page
  looked perfectly normal and did absolutely nothing when you chose a file.
  For a tool whose whole premise is opening a local file, that is worse than
  the integrity question.
- A version can now be checked. `tests/vendor.test.js` holds a digest of each
  file.

Each vendored file was fetched from cdnjs and, separately, extracted from the
package npm publishes. The two were byte-identical, so the digest recorded is
a fact about two independent copies agreeing rather than about one download.

**marked stays at 9.1.6.** `npm audit` reports no advisory against it. The
current release is 18.x, whose renderer API takes token objects instead of
positional arguments, so upgrading means rewriting the overrides and risking a
change in rendered output — which is a change to the interface, and out of
scope for this pass.

## Tests

None before. Now 155 under `node --test` plus 18 in a real browser, with no
dependencies to install.

```sh
npm test                 # both suites
npm run test:node        # 155
npm run test:browser     # 18, skips if no Chrome or Edge
npm run test:baseline    # the 18 against the first commit: 14 must fail
```

The suite is in two layers because the sanitiser cannot be run in Node without
a real DOM, and a shim faithful enough to run DOMPurify would be a larger and
less trustworthy thing than DOMPurify itself.

- **Node.** The real `index.html` in a `node:vm` context against a DOM written
  for it, with the real marked and a **pass-through** DOMPurify stub. These
  tests assert only that every string reaching the page went through the
  sanitiser. They make no claim about what sanitising does — a stub that
  pretended to sanitise would make the routing tests pass against a page that
  never called it, which is exactly the defect they exist to catch.
- **Browser.** `tests/browser/run.js` drives headless Chrome with
  `--headless=new --dump-dom`: no driver, no protocol client, no dependency.
  It stages `index.html` plus one appended script tag, checks the staged copy
  is the repository's file byte for byte up to that line, and reads results
  out of the dumped DOM. This is where the payloads are fired at a real
  browser and found not to run.

`tests/original.test.js` runs the Node harness against the baseline commit and
asserts it is broken in each of the eleven ways above, so nothing can pass for
a reason that was already true. `npm run test:baseline` does the same for the
browser layer: 14 of the 18 fail against the original, by name.

Two things that cost time and are worth knowing:

- **`node --test` adopts unhandled promise rejections and blames whichever
  test was running**, so a test that listens for `unhandledRejection` is failed
  by the runner before it can assert, and one that does not listen proves
  nothing because the runner has already swallowed it. `tests/rejection.js`
  runs that one check in a process of its own.
- **The browser layer earned its place on the first run.** `tests/dom.js`
  modelled `innerText` as suppressing a block element's line break when the
  preceding text already ended in a newline. Chrome does not: inside a `pre`
  the text newline is text and the block break is a separate thing, so a fenced
  block reads `"const a = 1;\n\nCopy"`, not `"…\nCopy"`. Two *generated*
  breaks do collapse, which is what keeps consecutive paragraphs reading
  `"one\ntwo"`. `tests/browser/run.js` re-checks three exact `innerText`
  values against the browser on every run, so the model cannot drift back.

## Left alone, deliberately

**No message on screen when something fails.** Items 8 and 10 are now noticed
and reported to the console rather than lost, but the reader still sees
nothing when a clipboard write is refused or a file cannot be read. Putting a
message on screen means new copy and a new interaction, which this pass is not
permitted to add. **This is the one thing here worth the author's decision**:
both failures are plausible in ordinary use — an unfocused document refuses a
clipboard write routinely — and "nothing happened" is a poor answer.

**`<form>` survives sanitising**, because DOMPurify's HTML profile allows it.
It cannot act — no handlers, no `javascript:` action, DOM clobbering blocked —
but a document can draw something that looks like a login box, and a `file://`
page can submit it anywhere. GitHub strips forms. Adding `form` to
`FORBID_TAGS` is one line and is a policy decision rather than a bug fix, so it
has been left and written down here and in the README instead.

**A dropped file is not checked for its type.** The picker has
`accept=".md,.markdown,.txt"`; the drop handler has nothing, so dropping a
binary renders mojibake. Refusing it means telling the reader why, which is
again new copy.

**`updateActiveToc()` runs on every scroll event** and calls
`getBoundingClientRect()` once per contents entry. On the bundled sample that
is 114 measurements per scroll event. It is not slow enough to see, and making
it an `IntersectionObserver` is a rewrite rather than a fix.

**marked 9.1.6 is not upgraded.** See item 11.

## Notes for whoever is next

Open `index.html` directly. No build, no server. `vendor/` has to travel with
it — that is the one thing that changed about how the file is deployed.

`FORTRAN_Guide_for_Students.md` is the thing to open to see it working: 114
headings, 91 code blocks, 13 tables. Note that **it never exercised the
identifier bugs** — all 114 of its headings are ASCII and distinct, so both the
original and the current file give it 114 distinct ids. Six of its 23
in-document links do not resolve on either version, because the document's own
contents uses abbreviated anchors (`#chapter-10-arrays`) for headings whose
full text is longer. That is a property of the document, not of the viewer, and
it is unchanged by this pass.

If you add anything that puts a string into the page, it goes through
`sanitise()`. The two tests that enforce it are in `tests/render.test.js`, and
they work by giving the page a sanitiser that returns its input unchanged — so
they fail for a page that ignores the return value as readily as for one that
never calls it.

`tests/dom.js` came from `Browser Extensions/stealthwriter-sessions` with six
additions, each written down at the top of the file with the bug that depends
on it. The additions worth stealing back are `classList.toggle(name, force)`,
a `style` that is a live view of the `style` attribute, and `innerText`.

**And this is the first project in this archive with a real browser in its
test suite.** `tests/browser/run.js` is about 200 lines and needs nothing
installed beyond a Chrome or an Edge, which any Windows machine has.
`--headless=new --dump-dom` loads a page, lets it run, and prints the DOM;
putting results into a `<div>` as JSON is enough of a protocol. Several
projects here have notes saying "nothing here can drive a browser". That is no
longer true, and `Browser Extensions/PrivatePages`, `PDF Comments`, `ADBS` and
`stealthwriter-sessions` all have manual checks outstanding that this technique
could reach.

## Licence, 2026-10-02

The author chose one licence for all of their projects: free for personal,
non-commercial use, modifiable for the user's own use, and not to be
distributed, original or modified. No standard licence says that, so `LICENSE`
is a short custom text, the same in every project apart from the year and what
it excludes. The README's licence section says the same, and `package.json`
declares `SEE LICENSE IN LICENSE`, npm's form for a licence with no SPDX
identifier. Anything above that calls the licence an open question, or calls
the project MIT, is superseded.

## CI, 2026-10-02

`.github/workflows/ci.yml` runs the node checks and the browser suite as two
jobs on `ubuntu-latest` (`npm test` runs both in one). Nothing has been
pushed, so it has not run on GitHub yet. Every job was run before committing,
from a fresh clone of this branch, the way a runner would run it: Linux jobs
in a throwaway Ubuntu 24.04 (the image `ubuntu-latest` uses) with the same
tool versions. 155 and 18.

The node job fetches full history: without it 20 checks skip rather than fail,
which would look green while checking less. The browser job fails if the
runner prints `SKIP`, which it does when it finds no Chrome; otherwise a
missing browser would read as a pass.
