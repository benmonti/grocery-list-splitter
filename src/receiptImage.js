const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);
const PNG_SIGNATURE = Buffer.from("89504e470d0a1a0a", "hex");

export function prepareReceiptUpload(file) {
    const buffer = file.buffer;

    // Some upload clients retain the HEIC name after converting the image.
    if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
        return { buffer, mimeType: "image/png" };
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { buffer, mimeType: "image/jpeg" };
    }

    const isHeic =
        (buffer.toString("ascii", 4, 8) === "ftyp" &&
            HEIF_BRANDS.has(buffer.toString("ascii", 8, 12))) ||
        /^image\/hei[cf](?:-sequence)?$/i.test(file.mimetype) ||
        /\.(heic|heif)$/i.test(file.originalname);

    if (!isHeic) return { buffer, mimeType: file.mimetype };

    // Decoding full-size HEIC photos can exceed Render's 512MB memory limit.
    // The browser converts and resizes these before uploading instead.
    throw new Error(
        "Please refresh this page and upload your HEIC receipt again so it can be converted before uploading. You can also upload a JPEG or PNG.",
    );
}
