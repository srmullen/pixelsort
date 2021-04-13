export type RGBA = [number, number, number, number];

export interface Pixel {
  coord: [number, number],
  data: RGBA
}

export function getPixel(imageData: ImageData, x: number, y: number): RGBA {
  const idx = x * 4 + (y * imageData.width * 4);
  return [
    imageData.data[idx],
    imageData.data[idx + 1],
    imageData.data[idx + 2],
    imageData.data[idx + 3],
  ]
}

export function setPixel(imageData: ImageData, x: number, y: number, rgba: RGBA) {
  const idx = x * 4 + (y * imageData.width * 4);
  imageData.data[idx] = rgba[0];
  imageData.data[idx + 1] = rgba[1];
  imageData.data[idx + 2] = rgba[2];
  imageData.data[idx + 3] = rgba[3];
}

export function getRow(imageData: ImageData, row: number): Pixel[] {
  const arr: Pixel[] = [];
  for (let x = 0; x < imageData.width; x++) {
    arr.push({ coord: [x, row], data: getPixel(imageData, x, row)});
  }
  return arr;
}

export function setRow(imageData: ImageData, row: number, data: RGBA[]) {
  for (let x = 0; x < imageData.width; x++) {
    // arr.push(getPixel(imageData, x, row));
    setPixel(imageData, x, row, data[x]);
  }
}

export function getColumn(imageData: ImageData, column: number) {
  const arr = [];
  for (let y = 0; y < imageData.height; y++) {
    arr.push(getPixel(imageData, column, y));
  }
  return arr;
}

export function setColumn(imageData: ImageData, column: number, data: RGBA[]) {
  for (let y = 0; y < imageData.height; y++) {
    setPixel(imageData, column, y, data[y]);
  }
}

export function redComparator(a: RGBA, b: RGBA) {
  if (a[0] === b[0]) {
    return 0;
  } else if (a[0] < b[0]) {
    return -1;
  } else {
    return 1;
  }
}

export function greenComparator(a: RGBA, b: RGBA) {
  if (a[1] === b[1]) {
    return 0;
  } else if (a[1] < b[1]) {
    return -1;
  } else {
    return 1;
  }
}

export function blueComparator(a: RGBA, b: RGBA) {
  if (a[2] === b[2]) {
    return 0;
  } else if (a[2] < b[2]) {
    return -1;
  } else {
    return 1;
  }
}

export function grayComparator(a: RGBA, b: RGBA) {
  const aAvg = (a[0] + a[1] + a[2]) / 3;
  const bAvg = (b[0] + b[1] + b[2]) / 3;
  if (aAvg === bAvg) {
    return 0;
  } else if (aAvg < bAvg) {
    return -1;
  } else {
    return 1;
  }
}