import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import { withGeminiRetries } from "../dist/geminiRetry.js";

function setupRetries(t) {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    t.mock.method(Math, "random", () => 0.5);
    t.mock.method(console, "warn", () => {});
}

test("returns a successful result without retrying", async (t) => {
    const generate = t.mock.fn(async () => "receipt");
    assert.equal(await withGeminiRetries(generate), "receipt");
    assert.equal(generate.mock.callCount(), 1);
});

test("recovers from 503s using exponential backoff and jitter", async (t) => {
    setupRetries(t);
    let calls = 0;
    const generate = t.mock.fn(async () => {
        calls += 1;
        if (calls < 3) throw { status: 503 };
        return "receipt";
    });
    const result = withGeminiRetries(generate);

    await setImmediate();
    t.mock.timers.tick(1499);
    await setImmediate();
    assert.equal(generate.mock.callCount(), 1);
    t.mock.timers.tick(1);
    await setImmediate();
    assert.equal(generate.mock.callCount(), 2);
    t.mock.timers.tick(2499);
    await setImmediate();
    assert.equal(generate.mock.callCount(), 2);
    t.mock.timers.tick(1);

    assert.equal(await result, "receipt");
    assert.equal(generate.mock.callCount(), 3);
});

test("stops after four failed calls and preserves the upstream error", async (t) => {
    setupRetries(t);
    const error = Object.assign(new Error("High demand"), { status: 503 });
    const generate = t.mock.fn(async () => {
        throw error;
    });
    const rejected = assert.rejects(
        withGeminiRetries(generate),
        (actual) => actual === error,
    );

    for (const delay of [1500, 2500, 4500]) {
        await setImmediate();
        t.mock.timers.tick(delay);
    }

    await rejected;
    assert.equal(generate.mock.callCount(), 4);
});

test("retries other transient API failures", async (t) => {
    for (const status of [408, 429, 500, 502, 504]) {
        await t.test(String(status), async (t) => {
            setupRetries(t);
            let calls = 0;
            const generate = t.mock.fn(async () => {
                calls += 1;
                if (calls === 1) throw { status };
                return "receipt";
            });
            const result = withGeminiRetries(generate);
            await setImmediate();
            t.mock.timers.tick(1500);
            assert.equal(await result, "receipt");
            assert.equal(generate.mock.callCount(), 2);
        });
    }
});

test("does not retry invalid requests, authentication errors, or unrelated failures", async (t) => {
    for (const error of [
        { status: 400 },
        { status: 401 },
        { status: 403 },
        { status: 404 },
        new Error("Invalid JSON"),
        null,
    ]) {
        const generate = t.mock.fn(async () => {
            throw error;
        });
        await assert.rejects(
            withGeminiRetries(generate),
            (actual) => actual === error,
        );
        assert.equal(generate.mock.callCount(), 1);
    }
});
