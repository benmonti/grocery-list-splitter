import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PNG } from "pngjs";
import { convertHeicToPng } from "../dist/heicConversion.js";

test("converts a real HEIC into PNG using browser canvas encoding", async (t) => {
    // Use the real HEIC decoder, with canvas encoding supplied by pngjs in Node.
    const originalImageData = Object.getOwnPropertyDescriptor(
        globalThis,
        "ImageData",
    );
    const originalDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
    );
    t.after(() => {
        for (const [name, descriptor] of [
            ["ImageData", originalImageData],
            ["document", originalDocument],
        ]) {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        }
    });
    globalThis.ImageData = class {
        constructor(data, width, height) {
            Object.assign(this, { data, width, height });
        }
    };
    globalThis.document = {
        createElement(tag) {
            assert.equal(tag, "canvas");
            let pixels;
            return {
                getContext() {
                    return {
                        putImageData(image) {
                            pixels = image;
                        },
                    };
                },
                toBlob(callback, type) {
                    assert.equal(type, "image/png");
                    const bytes = PNG.sync.write({
                        ...pixels,
                        data: Buffer.from(pixels.data),
                    });
                    callback(new Blob([bytes], { type }));
                },
            };
        },
    };
    const file = new Blob([
        readFileSync(new URL("./fixtures/receipt.heic", import.meta.url)),
    ]);
    const png = await convertHeicToPng(file);
    assert.equal(png.type, "image/png");
    const image = PNG.sync.read(Buffer.from(await png.arrayBuffer()));
    assert.equal(image.width, 64);
    assert.equal(image.height, 96);
    assert.ok(image.data[0] > 240, "white receipt background is preserved");
    assert.ok(
        image.data[(12 * 64 + 16) * 4] < 30,
        "dark receipt lines are preserved",
    );
});

test("rejects a corrupt HEIC instead of uploading the original to Render", async () => {
    await assert.rejects(convertHeicToPng(new Blob(["invalid HEIC"])));
});
