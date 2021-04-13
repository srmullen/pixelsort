<script lang="ts">
  import { onMount } from 'svelte';
  import { getPixel, setPixel, getRow, setRow, getColumn, setColumn, redComparator, greenComparator, blueComparator, grayComparator } from '../image';
  import type { RGBA, Pixel } from '../image';
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
      setPixel(imageData, pixels[i].coord[0], pixels[i].coord[1], pixels[i].data)
    }
  }

  function sortDiagonal(imageData: ImageData) {
    for (let x = 0; x < imageData.width; x++) {
      const diagonal = getImageVector(imageData, [x, 0], [1, 1]);
      const clone = diagonal.map(pix => pix);
      diagonal.sort((a, b) => grayComparator(a.data, b.data));
      // Add original pixel data onto sorted
      let pixels = [];
      for (let i = 0; i < clone.length; i++) {
        pixels.push({
          coord: clone[i].coord,
          data: diagonal[i].data
        });
      }
      setPixels(imageData, pixels);
    }
  }

  function drawImage() {
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
    sortDiagonal(imageData);

    ctx.putImageData(imageData, 0, 0);
  }
</script>

<img {src} alt="Svelte Logo" class="hidden" on:load={drawImage} bind:this={image} />

<div bind:this={container} class="w-full"></div>