type IcoFrame = {
  contents: Uint8Array;
  size: number;
};

const ICO_HEADER_BYTES = 6;
const ICO_ENTRY_BYTES = 16;
const ICO_TYPE_ICON = 1;
const ICO_COLOR_PLANES = 1;
const ICO_BITS_PER_PIXEL = 32;

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

function icoDimension(size: number): number {
  return size >= 256 ? 0 : size;
}

function buildIco(frames: readonly IcoFrame[]): Uint8Array {
  if (!frames.length) return new Uint8Array(0);

  const directoryBytes = ICO_HEADER_BYTES + (ICO_ENTRY_BYTES * frames.length);
  const payloadBytes = frames.reduce((total, frame) => total + frame.contents.length, 0);
  const output = new Uint8Array(directoryBytes + payloadBytes);
  const view = new DataView(output.buffer);

  writeUint16(view, 0, 0);
  writeUint16(view, 2, ICO_TYPE_ICON);
  writeUint16(view, 4, frames.length);

  let entryOffset = ICO_HEADER_BYTES;
  let payloadOffset = directoryBytes;

  for (const frame of frames) {
    output[entryOffset] = icoDimension(frame.size);
    output[entryOffset + 1] = icoDimension(frame.size);
    output[entryOffset + 2] = 0;
    output[entryOffset + 3] = 0;
    writeUint16(view, entryOffset + 4, ICO_COLOR_PLANES);
    writeUint16(view, entryOffset + 6, ICO_BITS_PER_PIXEL);
    writeUint32(view, entryOffset + 8, frame.contents.length);
    writeUint32(view, entryOffset + 12, payloadOffset);

    output.set(frame.contents, payloadOffset);
    entryOffset += ICO_ENTRY_BYTES;
    payloadOffset += frame.contents.length;
  }

  return output;
}

export { buildIco };
export type { IcoFrame };
