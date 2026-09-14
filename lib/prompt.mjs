// A dependency-free multi-select. Node builtins only.
import { emitKeypressEvents } from "node:readline";

/**
 * @param {{label: string, hint: string, checked: boolean}[]} items
 * @returns {Promise<number[]|null>} chosen indices, or null if aborted
 */
export function multiselect(items, { title, C }) {
  return new Promise((done) => {
    const out = process.stdout;
    const checked = items.map((i) => i.checked);
    let cur = 0;
    let drawn = 0;

    const draw = () => {
      if (drawn) out.write(`\x1b[${drawn}A`);
      out.write("\x1b[J");
      const lines = [];
      lines.push(`${C.b}${title}${C.x}`);
      lines.push(`${C.d}  ↑↓ move · space toggle · a all · enter install · esc cancel${C.x}`);
      lines.push("");
      items.forEach((it, i) => {
        const box = checked[i] ? `${C.g}◉${C.x}` : `${C.d}◯${C.x}`;
        const arrow = i === cur ? `${C.b}❯${C.x}` : " ";
        const label = i === cur ? `${C.b}${it.label}${C.x}` : it.label;
        lines.push(` ${arrow} ${box} ${label.padEnd(i === cur ? 30 : 22)} ${C.d}${it.hint}${C.x}`);
      });
      lines.push("");
      out.write(lines.join("\n") + "\n");
      drawn = lines.length + 1;
    };

    const finish = (result) => {
      process.stdin.setRawMode?.(false);
      process.stdin.pause();
      process.stdin.removeListener("keypress", onKey);
      out.write("\x1b[?25h"); // cursor back on
      done(result);
    };

    const onKey = (_str, key) => {
      if (!key) return;
      if (key.name === "up" || key.name === "k") cur = (cur - 1 + items.length) % items.length;
      else if (key.name === "down" || key.name === "j") cur = (cur + 1) % items.length;
      else if (key.name === "space") checked[cur] = !checked[cur];
      else if (key.name === "a") {
        const all = checked.every(Boolean);
        checked.fill(!all);
      } else if (key.name === "return" || key.name === "enter") {
        const picked = checked.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
        return finish(picked);
      } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        return finish(null);
      } else return;
      draw();
    };

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKey);
    out.write("\x1b[?25l"); // hide cursor
    draw();
  });
}
