/**
 * remark-sidenotes — `^[…]` becomes a margin note.
 *
 *   The measurement is noisy^[σ ≈ 0.4 on the held-out split], so the
 *   ranking is not stable.
 *
 * There is no parser extension behind this and no new dependency.
 * Remark leaves an undefined `[…]` reference as literal brackets in the
 * text, but it still parses everything between them as ordinary inline
 * markdown — emphasis, `code`, links, and (remark-math having run
 * first) `$maths$` — as children of the surrounding paragraph. So the
 * whole job is to find the `^[` and the `]` in the text nodes either
 * side, drop them, and wrap the nodes already sitting in between.
 *
 * That is also why a markdown link inside a note works: its own `]` is
 * consumed by the link parser and never reaches this scan. A bare `]`
 * or a shortcut `[ref]` inside a note does end it early — write those
 * ones as the raw form below.
 *
 * The emitted markup is deliberately the plain thing an author could
 * have typed by hand:
 *
 *   <input type="checkbox" class="note-toggle" id="sn-1">
 *   <label class="note-ref" for="sn-1">1</label>
 *   <span class="note" role="note"><span class="note__n">1</span>…</span>
 *
 * The checkbox is the whole narrow-screen interaction — no script — and
 * it is inert on wide screens, where CSS parks the note in the margin
 * whatever its state. Everything is phrasing content, because a note
 * usually lives mid-paragraph and an <aside> there would make the
 * browser close the <p> early and split the paragraph in two.
 *
 * A note that wants block content — a figure, a code sample — can be
 * written directly as `<aside class="note">…</aside>` between two
 * paragraphs instead. It gets the same treatment in the margin, minus
 * the number.
 */

const OPEN = '^[';
const CLOSE = ']';

const text = (value) => ({ type: 'text', value });

export default function remarkSidenotes() {
  return (tree) => {
    let n = 0;

    const walk = (node) => {
      if (!Array.isArray(node.children) || node.children.length === 0) return;

      /* `src` is scratch: a text node gets rewritten in place when a
         marker is sliced off it, so the scan can resume mid-node. */
      const src = node.children.slice();
      const out = [];

      for (let i = 0; i < src.length; i += 1) {
        const child = src[i];

        if (child.type !== 'text' || !child.value.includes(OPEN)) {
          out.push(child);
          walk(child);
          continue;
        }

        const at = child.value.indexOf(OPEN);
        if (at > 0) out.push(text(child.value.slice(0, at)));
        src[i] = text(child.value.slice(at + OPEN.length));

        const inner = [];
        let closed = false;

        for (; i < src.length; i += 1) {
          const node2 = src[i];

          if (node2.type !== 'text') {
            inner.push(node2);
            continue;
          }

          const end = node2.value.indexOf(CLOSE);
          if (end < 0) {
            if (node2.value) inner.push(node2);
            continue;
          }

          if (end > 0) inner.push(text(node2.value.slice(0, end)));
          const tail = node2.value.slice(end + CLOSE.length);
          /* Hand the tail back to the outer loop — it may open another
             note further along the same run of text. */
          if (tail) {
            src[i] = text(tail);
            i -= 1;
          }
          closed = true;
          break;
        }

        /* Never eat text: an unterminated `^[` goes back verbatim. */
        if (!closed) {
          out.push(text(OPEN), ...inner);
          continue;
        }

        inner.forEach(walk);

        const id = `sn-${(n += 1)}`;
        out.push(
          {
            type: 'html',
            value:
              `<input type="checkbox" class="note-toggle" id="${id}" aria-label="note ${n}" />` +
              `<label class="note-ref" for="${id}">${n}</label>` +
              `<span class="note" role="note"><span class="note__n">${n}</span>`,
          },
          ...inner,
          { type: 'html', value: '</span>' },
        );
      }

      node.children = out;
    };

    walk(tree);
  };
}
