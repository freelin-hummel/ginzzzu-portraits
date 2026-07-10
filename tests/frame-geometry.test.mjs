import assert from "node:assert/strict";
import test from "node:test";
import { fittedFrameWidth } from "../scripts/core/frame-geometry.js";

test("portrait frames preserve the image aspect ratio within the layout slot", () => {
  assert.equal(fittedFrameWidth({
    naturalWidth: 600,
    naturalHeight: 1200,
    renderedHeight: 500,
    slotWidth: 420
  }), 250);
});

test("wide images stay bounded by the portrait layout slot", () => {
  assert.equal(fittedFrameWidth({
    naturalWidth: 1200,
    naturalHeight: 600,
    renderedHeight: 500,
    slotWidth: 420
  }), 420);
});
