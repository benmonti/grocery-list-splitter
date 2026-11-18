export async function convertHeicToPng(file: Blob): Promise<Blob> {
    const { default: convert } = await import("heic-convert/browser.js");
    const converted = await convert({
        buffer: new Uint8Array(await file.arrayBuffer()),
        format: "PNG",
    });

    return new Blob([new Uint8Array(converted).buffer], { type: "image/png" });
}
