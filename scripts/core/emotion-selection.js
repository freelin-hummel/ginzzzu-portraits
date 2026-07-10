export function createEmotionUpdateCoordinator() {
  const pending = new Map();
  const queues = new Map();

  return {
    get(actorId, fallback = "none") {
      const id = String(actorId || "");
      return pending.has(id) ? pending.get(id) : fallback;
    },

    clear(actorId, expectedKey = undefined) {
      const id = String(actorId || "");
      if (!pending.has(id)) return;
      if (expectedKey !== undefined && pending.get(id) !== expectedKey) return;
      pending.delete(id);
    },

    clearIfMatches(actorId, key) {
      this.clear(actorId, key);
    },

    request(actorId, key, update) {
      const id = String(actorId || "");
      const nextKey = String(key || "none");
      pending.set(id, nextKey);

      const previous = queues.get(id) || Promise.resolve();
      const task = previous.catch(() => {}).then(async () => {
        // A newer click supersedes this write before it reaches Foundry.
        if (pending.get(id) !== nextKey) return false;
        await update();
        if (pending.get(id) === nextKey) pending.delete(id);
        return true;
      });

      const settled = task.finally(() => {
        if (queues.get(id) === settled) queues.delete(id);
      });
      queues.set(id, settled);
      return task;
    }
  };
}
