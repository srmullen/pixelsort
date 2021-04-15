<script lang="ts">
  import { onMount } from 'svelte';
  import { wait, randomInt, createCanvas } from '../utils';

  export let image: HTMLImageElement;

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  onMount(() => {
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

    // await sortRows(ctx, imageData);

    // await sortDiagonal(ctx, imageData);

    // await sortDiagonalParallel(ctx, imageData);

    ctx.putImageData(imageData, 0, 0);
  });
</script>

<div bind:this={container} class="w-full"></div>