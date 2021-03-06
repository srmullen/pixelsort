<script lang="ts">
  import { getPixel, setPixel, getRow, setRow, getColumn, setColumn, redComparator, greenComparator, blueComparator, grayComparator } from '../image';
  import type { RGBA, Pixel } from '../image';
  import { shell, insertion, comb, merge, quick, selection, heap } from '../sort/sort';
  import { wait, randomInt, createCanvas, saveURL, download } from '../utils';
  import * as R from 'ramda';

  type Point = [number, number];

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
  let ctx: CanvasRenderingContext2D;
  let video: HTMLVideoElement;

  let sorting = false;

  async function sortRows(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    let sorters = [];

    const exchangeIndicesAndUpdateImageData = (arr: Pixel[], a: number, b: number): void => {
      // Update the imageData values as sorting is happening
      const coordA = arr[a].coord;
      const coordB = arr[b].coord;
      swapImageDataPixels(imageData, coordA, coordB);

      const tmp = arr[a].data;
      arr[a].data = arr[b].data;
      arr[b].data = tmp;
    }

    const copyFromListAndUpdateImageData = (copy: Pixel[], into: Pixel[], copyIndex: number, intoIndex: number) => {
      const intoPixel = into[intoIndex];
      const copyPixel = copy[copyIndex];
      setPixel(imageData, intoPixel.coord[0], intoPixel.coord[1], copyPixel.data);
      // setPixel(imageData, copyPixel.coord[0], copyPixel.coord[1], intoPixel.data);

      into[intoIndex] = copy[copyIndex];
    }

    for (let row = 0; row < imageData.height; row++) {
      const data = getRow(imageData, row);

      sorters.push(shell(
        exchangeIndicesAndUpdateImageData, 
        (a, b) => grayComparator(a.data, b.data), 
        data
      ));

      // sorters.push(quick(
      //   exchangeIndicesAndUpdateImageData, 
      //   (a, b) => grayComparator(a.data, b.data), 
      //   data
      // ));

      // sorters.push(insertion(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, data));

      // sorters.push(comb(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, data));

      // sorters.push(selection(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, data));

      // sorters.push(heap(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, data));
      
      // sorters.push(merge(
      //   copyFromListAndUpdateImageData, 
      //   (a, b) => grayComparator(a.data, b.data), 
      //   data
      // ));
    }

    let swapIterations = 0;
    const swapRate = 20;


    // let done = nextSwaps(sorters);
    let gen = nextSwaps(sorters);
    // let done = false;
    let { done } = gen.next();
    while (!done && sorting) {
      for (done of nextSwaps(sorters)) {
          if (!sorting) {
            break;
          }
          if (swapIterations % swapRate === 0) {
          ctx.putImageData(imageData, 0, 0);
          await wait(1);
        }
        swapIterations++;
      }
      done = gen.next().done;
      // done = nextSwaps(sorters);
    }
  }

  async function record(fn: () => Promise<any>) {
    // Record
    // @ts-ignore
    const videoStream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(videoStream);

    const chunks: any[] = []
    mediaRecorder.ondataavailable = function(e: any) {
      chunks.push(e.data);
    }

    mediaRecorder.onstop = () => {
      // const blob = new Blob(chunks, { type: 'video/mp4' });
      // const videoURL = URL.createObjectURL(blob);
      // video.src = videoURL;
      // download(videoURL)
      download(chunks);
    }

    mediaRecorder.start();
    await fn();
    mediaRecorder.stop();
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

  function setPixels(imageData: ImageData, pixels: Pixel[]) {
    for (let i = 0; i < pixels.length; i++) {
      setPixel(imageData, pixels[i].coord[0], pixels[i].coord[1], pixels[i].data);
    }
  }

  /**
   * Swap pixel data for the given pixel indices.
   * Return only the swapped pixels so they can be rendered individually.
   */
  function swapPixels(pixels: Pixel[], i1: number, i2: number): [Pixel, Pixel] {
    const tmp = pixels[i1].data;
    pixels[i1].data = pixels[i2].data;
    pixels[i2].data = tmp;
    return [pixels[i1], pixels[i2]];
  }

  function getSwapPixels(pixels: Pixel[], i1: number, i2: number) {
    return [pixels[i1], pixels[i2]];
  }

  async function sortDiagonal(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    for (let x = 0; x < imageData.width; x++) {
      const diagonal = getImageVector(imageData, [x, 0], [1, 1]);
      const clone = diagonal.map(pix => pix);

      const sorted = [...shell(exchangeIndices, (a, b) => grayComparator(a.data, b.data), diagonal)];
      for (let i = 0; i < sorted.length; i++) {
        const swap = sorted[i];
        // const swapped = swapPixels(clone, swap[0], swap[1]);
        const swapped = swapPixels(diagonal, swap[0], swap[1]);

        // setPixels(imageData, swapped);
        swapImageDataPixels(imageData, swapped[0].coord, swapped[1].coord);
      }
      await wait(1);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  function* nextSwaps(gens: Generator[]) {
    let done = false;
    while (!done) {
      const swaps: [number, number][] = [];
      done = true;
      for (let i = 0; i < gens.length; i++) {
        const iter = gens[i].next();
        if (!iter.done) {
          done = false;
        }
        swaps.push(iter.value);
      }
      yield done;
    }
  }

  async function sortDiagonalParallel(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const vectors = [];
    const sorters = [];

    const exchangeIndicesAndUpdateImageData = (arr: Pixel[], a: number, b: number): void => {
      // Update the imageData for rendering
      const coordA = arr[a].coord;
      const coordB = arr[b].coord;
      swapImageDataPixels(imageData, coordA, coordB);

      // Exchange the indices for the sort function.
      const tmp = arr[a].data;
      arr[a].data = arr[b].data;
      arr[b].data = tmp;
    }

    for (let x = 0; x < imageData.width-1; x++) {
      const imageVector = getImageVector(imageData, [x, 0], [1, 1]);
      vectors.push(imageVector);
      
      sorters.push(comb(exchangeIndicesAndUpdateImageData, (a, b) => {
        return grayComparator(a.data, b.data);
      }, imageVector));

      // sorters.push(shell(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, imageVector));

      // sorters.push(insertion(exchangeIndicesAndUpdateImageData, (a, b) => {
      //   return grayComparator(a.data, b.data);
      // }, imageVector));
    }

    let swapIterations = 0;
    for (let swaps of nextSwaps(sorters)) {
      swapIterations++;
      // Only draw and wait every 10 iterations
      if (swapIterations % 100 === 0) {
        ctx.putImageData(imageData, 0, 0);
        await wait(1);
      }
    }
  }

  function swapImageDataPixels(imageData: ImageData, pos1: Point, pos2: Point) {
    const pix1 = getPixel(imageData, pos1[0], pos1[1]);
    const pix2 = getPixel(imageData, pos2[0], pos2[1]);
    setPixel(imageData, pos2[0], pos2[1], pix1)
    setPixel(imageData, pos1[0], pos1[1], pix2)
  }

  async function scrambleImageData(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    let iter = 0;
    while (iter < 10000) {
      for (let i = 0; i < 1000; i++) {
        const pos1: Point = [randomInt(imageData.width), randomInt(imageData.height)];
        const pos2: Point = [randomInt(imageData.width), randomInt(imageData.height)];
        swapImageDataPixels(imageData, pos1, pos2);
      }
      ctx.putImageData(imageData, 0, 0);
      iter++;
      await wait(1);
    }
  }

  async function onImageLoad() {
    canvas = createCanvas([image.width, image.height], {
      className: 'w-full'
    });
    
    ctx = canvas.getContext('2d')!;
    if (!ctx) throw new Error('ctx not defined');
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.rect(0, 0, image.width, image.height);
    ctx.fill();
    
    ctx.drawImage(image, 0, 0, image.width, image.height);
    container.appendChild(canvas);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    // await sortRows(ctx, imageData);

    // await sortDiagonal(ctx, imageData);

    // await sortDiagonalParallel(ctx, imageData);

    ctx.putImageData(imageData, 0, 0);
    console.log('ready');
  }

  async function runSort() {
    if (!sorting) {
      sorting = true;
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      await record(() => sortRows(ctx, imageData));
    } else {
      sorting = false;
    }
  }
</script>

<img 
  {src} 
  alt="Sorting" 
  class="hidden" 
  on:load={onImageLoad} 
  bind:this={image} 
  crossorigin="anonymous"
/>

<div>
  <div>
    <button class="px-4 py-3 bg-red-600 text-white" on:click={runSort}>
      {#if sorting}
        Stop
      {:else}
        Sort
      {/if}
    </button>
  </div>
  <div bind:this={container} class="w-full"></div>
  <video bind:this={video}></video>
</div>
