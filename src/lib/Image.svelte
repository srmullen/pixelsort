<script lang="ts">
  import { getPixel, setPixel, getRow, setRow, getColumn, setColumn, redComparator, greenComparator, blueComparator, grayComparator } from '../image';
  import type { RGBA, Pixel } from '../image';
  import { shell } from '../sort/sort';
  import { wait } from '../utils';


  /*
   * Exchange position of two elements in an array.
   */
  export function exchangeIndices<T>(arr: T[], a: number, b: number): void {
    const temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }

  /*
   * Copys the index from one list into another list.
   * Does not mutate the copy list.
   */
  export function copyFromList<T>(copy: T[], into: T[], copyIndex: number, intoIndex: number) {
    into[intoIndex] = copy[copyIndex];
  }

  /*
   * Places the item at the given position in the array and returns the item
   * that was previously at the position.
   */
  export function swapOut<T>(arr: T[], pos: number, item: T): T {
    const prev = arr[pos];
    arr[pos] = item;
    return prev;
  }

  export let src: string;

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let image: HTMLImageElement;

  interface CanvasOpts {
    id?: string;
    style?: string;
    className?: string,
    hidden?: boolean;
    el?: HTMLElement;
  }

  export function createCanvas(
    [width, height]: [number, number],
    { hidden = false, el = document.body, id, style, className }: CanvasOpts = {}
  ) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (style) {
      // @ts-ignore
      canvas.style = style;
    }
    if (className) {
      canvas.className = className;
    }
    canvas.hidden = hidden;
    if (id) {
      canvas.id = id;
    }
    el.appendChild(canvas);

    return canvas;
  }

  function grayscale(imageData: ImageData) {
    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        const pix = getPixel(imageData, x, y);
        const avg = (pix[0] + pix[1] + pix[2]) / 3;
        setPixel(imageData, x, y, [avg, avg, avg, 255]);
      }
    }
  }


  function sortRows(imageData: ImageData) {
    for (let row = 0; row < imageData.height; row++) {
      const data = getRow(imageData, row);
      // data.sort(redComparator);
      // data.sort(greenComparator);
      // data.sort(blueComparator);
      data.sort((a, b) => grayComparator(a.data, b.data));
      setRow(imageData, row, data.map(pix => pix.data));
    }
  }

  function getImageVector(imageData: ImageData, from: [number, number], vector: [number, number]): Pixel[] {
    const arr: Pixel[] = [];
    let sentry = 100000;
    let iter = 0;
    let coord: [number, number] = [from[0], from[1]];
    let pixelData = getPixel(imageData, coord[0], coord[1]);
    while (coord[0] < imageData.width && coord[1] < imageData.height && iter < sentry) {
      arr.push({ coord, data: pixelData });
      coord = [coord[0] + vector[0], coord[1] + vector[1]];
      pixelData = getPixel(imageData, coord[0], coord[1]);
      iter++;
    }
    return arr;
  }

  function getPixels(imageData: ImageData, area: any): Pixel[] {
    const pixels: Pixel[] = [];
    for (let i = 0; i < area.row; i++) {

    }
    return pixels;
  }

  function setPixels(imageData: ImageData, pixels: Pixel[]) {
    for (let i = 0; i < pixels.length; i++) {
      setPixel(imageData, pixels[i].coord[0], pixels[i].coord[1], pixels[i].data);
    }
  }

  async function sortDiagonal(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const diagonals = [];
    for (let x = 0; x < 200; x++) {
      const diagonal = getImageVector(imageData, [x, 0], [1, 1]);
      const clone = diagonal.map(pix => pix);

      // diagonal.sort((a, b) => grayComparator(a.data, b.data));
      const sorted = [{ list: clone }, ...shell(exchangeIndices, (a, b) => grayComparator(a.data, b.data), diagonal)];

      diagonals.push(sorted);
    }

    const max = diagonals.reduce((acc, diagonal) => diagonal.length > acc ? diagonal.length: acc, 0);
    for (let idx = 1; idx < max; idx++) {
      diagonals.map(async (sorted) => {
        if (sorted[idx]) {
          const orig = sorted[0].list;
          const list = sorted[idx].list;
          const pixels = [];
          for (let i = 0; i < list.length; i++) {
            pixels.push({
              coord: orig[i].coord,
              data: list[i].data
            });
          }
          setPixels(imageData, pixels); 
        }
      });
      ctx.putImageData(imageData, 0, 0);
      await wait(1);
    }
  }

  async function drawImage() {
    canvas = createCanvas([image.width, image.height], {
      className: 'w-full'
    });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ctx not defined');
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.rect(0, 0, image.width, image.height);
    ctx.fill();
    
    ctx.drawImage(image, 0, 0, image.width, image.height);
    container.appendChild(canvas);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    // grayscale(imageData);
    // sortRows(imageData);
    await sortDiagonal(ctx, imageData);
    console.log('here');
    ctx.putImageData(imageData, 0, 0);
  }
</script>

<img {src} alt="Svelte Logo" class="hidden" on:load={drawImage} bind:this={image} />

<div bind:this={container} class="w-full"></div>