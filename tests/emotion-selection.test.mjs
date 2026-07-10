import test from "node:test";
import assert from "node:assert/strict";
import { createEmotionUpdateCoordinator } from "../scripts/core/emotion-selection.js";

const pause = () => new Promise((resolve) => setImmediate(resolve));

test("uses the pending selection while an actor update is in flight", async () => {
  const coordinator = createEmotionUpdateCoordinator();
  const writes = [];
  let release;
  const blocked = new Promise((resolve) => { release = resolve; });

  const first = coordinator.request("actor", "joy", async () => {
    writes.push("joy");
    await blocked;
  });

  await pause();
  assert.equal(coordinator.get("actor", "none"), "joy");

  const second = coordinator.request("actor", "anger", async () => {
    writes.push("anger");
  });
  release();

  await Promise.all([first, second]);
  assert.deepEqual(writes, ["joy", "anger"]);
  assert.equal(coordinator.get("actor", "none"), "none");
});

test("collapses superseded clicks before the first write starts", async () => {
  const coordinator = createEmotionUpdateCoordinator();
  const writes = [];

  const first = coordinator.request("actor", "joy", async () => writes.push("joy"));
  const second = coordinator.request("actor", "sad", async () => writes.push("sad"));

  await Promise.all([first, second]);
  assert.deepEqual(writes, ["sad"]);
});

test("does not clear a newer pending selection when an older write settles", async () => {
  const coordinator = createEmotionUpdateCoordinator();
  let release;
  const blocked = new Promise((resolve) => { release = resolve; });

  const first = coordinator.request("actor", "joy", () => blocked);
  await pause();
  coordinator.request("actor", "anger", async () => {});
  release();
  await first;

  assert.equal(coordinator.get("actor", "none"), "anger");
});
