<script lang="ts">
  import netherlands from './assets/netherlands.jpeg'
  import { randomImageURL } from './utils';
  import Image from './lib/Image.svelte';
  import Canvas from './lib/Canvas.svelte';
  import Tailwind from './Tailwind.svelte';

  const src = randomImageURL();

  let image: HTMLImageElement;
  
  function onImageLoad(event: Event) {
    image = event.target as HTMLImageElement;
  }

  function sortImage() {

  }
</script>

<Tailwind />

<main class="p-4 mx-0">
  <Image 
    {src}
    on:load={onImageLoad}
  />
  <!-- {#if image}
    <Canvas {image} />
  {/if} -->
</main>