const DATA_CODEWORDS_L = [0, 19, 34, 55, 80, 108, 136, 156, 194, 232, 274];
const EC_CODEWORDS_PER_BLOCK_L = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
const NUM_ERROR_BLOCKS_L = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4];
const ALIGNMENT_POSITIONS = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];
const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0;
}

function appendBits(buffer, value, length) {
  for (let i = length - 1; i >= 0; i--) {
    buffer.push((value >>> i) & 1);
  }
}

function makeByteData(text, version) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const dataCapacityBits = DATA_CODEWORDS_L[version] * 8;
  const countBits = version < 10 ? 8 : 16;
  const bits = [];

  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, countBits);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const terminator = Math.min(4, dataCapacityBits - bits.length);
  appendBits(bits, 0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }

  for (let pad = 0xec; data.length < DATA_CODEWORDS_L[version]; pad ^= 0xfd) {
    data.push(pad);
  }

  return data;
}

function chooseVersion(text) {
  const byteLength = Array.from(new TextEncoder().encode(text)).length;
  for (let version = 1; version <= 10; version++) {
    const countBits = version < 10 ? 8 : 16;
    const requiredBits = 4 + countBits + byteLength * 8;
    if (requiredBits <= DATA_CODEWORDS_L[version] * 8) return version;
  }
  throw new Error("Payment link is too long for the built-in QR generator.");
}

let gfExp = null;
let gfLog = null;

function initGalois() {
  if (gfExp && gfLog) return;

  gfExp = Array(512).fill(0);
  gfLog = Array(256).fill(0);
  let value = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = value;
    gfLog[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];
}

function gfMultiply(x, y) {
  if (x === 0 || y === 0) return 0;
  initGalois();
  return gfExp[gfLog[x] + gfLog[y]];
}

function reedSolomonGenerator(degree) {
  let result = [1];
  for (let i = 0; i < degree; i++) {
    const next = Array(result.length + 1).fill(0);
    result.forEach((coefficient, index) => {
      next[index] ^= gfMultiply(coefficient, 1);
      next[index + 1] ^= gfMultiply(coefficient, gfExp[i]);
    });
    result = next;
  }
  return result.slice(1);
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    generator.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });

  return result;
}

function addEccAndInterleave(data, version) {
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK_L[version];
  const numBlocks = NUM_ERROR_BLOCKS_L[version];
  const rawCodewords = DATA_CODEWORDS_L[version] + ecPerBlock * numBlocks;
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockDataLength = Math.floor(rawCodewords / numBlocks) - ecPerBlock;
  const blocks = [];
  let dataIndex = 0;

  for (let i = 0; i < numBlocks; i++) {
    const dataLength = shortBlockDataLength + (i < numShortBlocks ? 0 : 1);
    const blockData = data.slice(dataIndex, dataIndex + dataLength);
    dataIndex += dataLength;
    blocks.push({ data: blockData, ecc: reedSolomonRemainder(blockData, ecPerBlock) });
  }

  const result = [];
  const maxDataLength = Math.max(...blocks.map((block) => block.data.length));
  for (let i = 0; i < maxDataLength; i++) {
    blocks.forEach((block) => {
      if (i < block.data.length) result.push(block.data[i]);
    });
  }
  for (let i = 0; i < ecPerBlock; i++) {
    blocks.forEach((block) => result.push(block.ecc[i]));
  }

  return result;
}

function createBlankMatrix(size) {
  return {
    modules: Array.from({ length: size }, () => Array(size).fill(false)),
    functions: Array.from({ length: size }, () => Array(size).fill(false)),
  };
}

function setFunction(matrix, x, y, isDark) {
  if (x < 0 || y < 0 || y >= matrix.modules.length || x >= matrix.modules.length) return;
  matrix.modules[y][x] = isDark;
  matrix.functions[y][x] = true;
}

function drawFinder(matrix, x, y) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      const dark =
        dx >= 0 &&
        dx <= 6 &&
        dy >= 0 &&
        dy <= 6 &&
        (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunction(matrix, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix, x, y) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunction(matrix, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawFunctionPatterns(matrix, version) {
  const size = matrix.modules.length;
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, size - 7, 0);
  drawFinder(matrix, 0, size - 7);

  for (let i = 0; i < size; i++) {
    if (!matrix.functions[6][i]) setFunction(matrix, i, 6, i % 2 === 0);
    if (!matrix.functions[i][6]) setFunction(matrix, 6, i, i % 2 === 0);
  }

  const positions = ALIGNMENT_POSITIONS[version];
  positions.forEach((x) => {
    positions.forEach((y) => {
      const overlapsFinder =
        (x <= 8 && y <= 8) ||
        (x >= size - 9 && y <= 8) ||
        (x <= 8 && y >= size - 9);
      if (!overlapsFinder) drawAlignment(matrix, x, y);
    });
  });

  setFunction(matrix, 8, size - 8, true);

  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setFunction(matrix, 8, i, false);
      setFunction(matrix, i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunction(matrix, size - 1 - i, 8, false);
    setFunction(matrix, 8, size - 1 - i, false);
  }

  if (version >= 7) drawVersion(matrix, version);
}

function drawVersion(matrix, version) {
  const size = matrix.modules.length;
  let remainder = version;
  for (let i = 0; i < 12; i++) {
    remainder = (remainder << 1) ^ (((remainder >>> 11) & 1) ? 0x1f25 : 0);
  }
  const bits = (version << 12) | remainder;

  for (let i = 0; i < 18; i++) {
    const dark = getBit(bits, i);
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunction(matrix, a, b, dark);
    setFunction(matrix, b, a, dark);
  }
}

function drawFormat(matrix, mask) {
  const size = matrix.modules.length;
  const data = (1 << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) ? 0x537 : 0);
  }
  const bits = ((data << 10) | remainder) ^ 0x5412;

  for (let i = 0; i <= 5; i++) setFunction(matrix, 8, i, getBit(bits, i));
  setFunction(matrix, 8, 7, getBit(bits, 6));
  setFunction(matrix, 8, 8, getBit(bits, 7));
  setFunction(matrix, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFunction(matrix, 14 - i, 8, getBit(bits, i));

  for (let i = 0; i < 8; i++) setFunction(matrix, size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFunction(matrix, 8, size - 15 + i, getBit(bits, i));
  setFunction(matrix, 8, size - 8, true);
}

function placeData(matrix, codewords) {
  const size = matrix.modules.length;
  let bitIndex = 0;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;

    for (let vert = 0; vert < size; vert++) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vert : vert;

      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (matrix.functions[y][x]) continue;

        const codeword = codewords[Math.floor(bitIndex / 8)] || 0;
        matrix.modules[y][x] = getBit(codeword, 7 - (bitIndex % 8));
        bitIndex++;
      }
    }
  }
}

function maskBit(mask, x, y) {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(matrix, mask) {
  const size = matrix.modules.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix.functions[y][x] && maskBit(mask, x, y)) {
        matrix.modules[y][x] = !matrix.modules[y][x];
      }
    }
  }
}

function cloneMatrix(matrix) {
  return {
    modules: matrix.modules.map((row) => row.slice()),
    functions: matrix.functions.map((row) => row.slice()),
  };
}

function getPenalty(matrix) {
  const modules = matrix.modules;
  const size = modules.length;
  let penalty = 0;

  for (let y = 0; y < size; y++) {
    let runColor = modules[y][0];
    let runLength = 1;
    for (let x = 1; x < size; x++) {
      if (modules[y][x] === runColor) {
        runLength++;
        if (runLength === 5) penalty += PENALTY_N1;
        else if (runLength > 5) penalty++;
      } else {
        runColor = modules[y][x];
        runLength = 1;
      }
    }
  }

  for (let x = 0; x < size; x++) {
    let runColor = modules[0][x];
    let runLength = 1;
    for (let y = 1; y < size; y++) {
      if (modules[y][x] === runColor) {
        runLength++;
        if (runLength === 5) penalty += PENALTY_N1;
        else if (runLength > 5) penalty++;
      } else {
        runColor = modules[y][x];
        runLength = 1;
      }
    }
  }

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) {
        penalty += PENALTY_N2;
      }
    }
  }

  const pattern = [true, false, true, true, true, false, true, false, false, false, false];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x <= size - pattern.length; x++) {
      if (pattern.every((value, index) => modules[y][x + index] === value)) penalty += PENALTY_N3;
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y <= size - pattern.length; y++) {
      if (pattern.every((value, index) => modules[y + index][x] === value)) penalty += PENALTY_N3;
    }
  }

  let dark = 0;
  modules.forEach((row) => row.forEach((module) => { if (module) dark++; }));
  const total = size * size;
  const k = Math.floor(Math.abs(dark * 20 - total * 10) / total);
  penalty += k * PENALTY_N4;

  return penalty;
}

export function createQrMatrix(text) {
  const version = chooseVersion(text);
  const size = version * 4 + 17;
  const data = makeByteData(text, version);
  const codewords = addEccAndInterleave(data, version);
  const base = createBlankMatrix(size);
  drawFunctionPatterns(base, version);
  placeData(base, codewords);

  let best = null;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = cloneMatrix(base);
    applyMask(candidate, mask);
    drawFormat(candidate, mask);
    const penalty = getPenalty(candidate);
    if (penalty < bestPenalty) {
      best = candidate.modules;
      bestPenalty = penalty;
    }
  }

  return best;
}

export function qrMatrixToSvg(matrix, scale = 8, margin = 4) {
  const size = matrix.length;
  const fullSize = (size + margin * 2) * scale;
  const rects = [];

  matrix.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) rects.push(`<rect x="${(x + margin) * scale}" y="${(y + margin) * scale}" width="${scale}" height="${scale}"/>`);
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fullSize}" height="${fullSize}" viewBox="0 0 ${fullSize} ${fullSize}" role="img" aria-label="POS payment QR code"><rect width="100%" height="100%" fill="#fff"/><g fill="#08080A">${rects.join("")}</g></svg>`;
}

export function qrMatrixToDataUrl(matrix, scale = 8, margin = 4) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(qrMatrixToSvg(matrix, scale, margin))}`;
}

export function drawQrToCanvas(canvas, matrix, scale = 12, margin = 4) {
  const size = matrix.length;
  const fullSize = (size + margin * 2) * scale;
  const context = canvas.getContext("2d");
  canvas.width = fullSize;
  canvas.height = fullSize;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, fullSize, fullSize);
  context.fillStyle = "#08080A";

  matrix.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) context.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
    });
  });
}