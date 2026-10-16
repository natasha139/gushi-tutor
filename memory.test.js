import test from "node:test";
import assert from "node:assert/strict";
import { schedule, validItem } from "./memory.js";
test("successful recall expands intervals and caps at 60 days", () => {
  [1, 2, 4, 7, 15, 30, 60, 60].forEach((days, stage) => {
    const next = schedule(stage, "good", 1000);
    assert.equal(next.due_at, 1000 + days * 86400000);
    assert.equal(next.stage, Math.min(stage + 1, 7));
  });
});
test("forgotten content restarts, prompted recall steps back", () => {
  assert.deepEqual(schedule(5, "again", 1000), {
    stage: 0,
    due_at: 601000,
    last_review: 1000,
  });
  assert.equal(schedule(5, "hard", 0).stage, 4);
  assert.equal(schedule(0, "hard", 0).stage, 0);
  assert.equal(schedule(5, "hard", 0).due_at, 86400000);
  assert.throws(() => schedule(0, "invalid"));
});
test("all four content kinds validate; blank and oversized input fails", () => {
  for (const kind of ["word", "idiom", "poem", "prose"])
    assert.equal(
      validItem({ kind, title: "背诵", answer: "正文", hint: "" }),
      true,
    );
  for (const body of [
    { kind: "other", title: "a", answer: "b", hint: "" },
    { kind: "word", title: " ", answer: "b", hint: "" },
    { kind: "word", title: "a", answer: "x".repeat(10001), hint: "" },
  ])
    assert.equal(validItem(body), false);
});
