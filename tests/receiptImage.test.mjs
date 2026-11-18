import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PNG } from "pngjs";
import { prepareReceiptUpload } from "../dist/receiptImage.js";

const heic = readFileSync(new URL("./fixtures/receipt.heic", import.meta.url));

test("rejects raw HEIC before starting any server-side decoding", () => {
    for (const metadata of [
        { mimetype: "image/heic", originalname: "receipt.heic" },
        { mimetype: "application/octet-stream", originalname: "receipt" },
        { mimetype: "image/heif-sequence", originalname: "receipt.heif" },
    ]) {
        assert.throws(
            () => prepareReceiptUpload({ buffer: heic, ...metadata }),
            /converted before uploading/,
        );
    }
});

test("accepts PNG content even when an upload client retains HEIC metadata", () => {
    const png = new PNG({ width: 1, height: 1 });
    const buffer = PNG.sync.write(png);
    const receipt = prepareReceiptUpload({
        buffer,
        mimetype: "image/heic",
        originalname: "receipt.heic",
    });
    assert.equal(receipt.mimeType, "image/png");
    assert.equal(
        receipt.buffer,
        buffer,
        "does not allocate a second upload buffer",
    );
});

test("recognizes JPEG content with missing or incorrect MIME metadata", () => {
    const buffer = Buffer.from("ffd8ffe00010", "hex");
    const receipt = prepareReceiptUpload({
        buffer,
        mimetype: "application/octet-stream",
        originalname: "receipt.heic",
    });
    assert.equal(receipt.mimeType, "image/jpeg");
    assert.equal(receipt.buffer, buffer);
});

test("passes other image formats through without decoding", () => {
    const buffer = Buffer.from("RIFFtestWEBP");
    const receipt = prepareReceiptUpload({
        buffer,
        mimetype: "image/webp",
        originalname: "receipt.webp",
    });
    assert.deepEqual(receipt, { buffer, mimeType: "image/webp" });
});
