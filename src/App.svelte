<script lang="ts">
  import { randomImageURL } from './utils';
  import Image from './lib/Image.svelte';
  // import Canvas from './lib/Canvas.svelte';
  import Tailwind from './Tailwind.svelte';

  // const src = randomImageURL();
  // const src = `https://images.unsplash.com/photo-1498940757830-82f7813bf178?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxfDB8MXxhbGx8fHx8fHx8fA&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit`;
  const src = 'https://source.unsplash.com/1920x1440/?colorful'

  let image: HTMLImageElement;
  
  function onImageLoad(event: Event) {
    image = event.target as HTMLImageElement;
  }
</script>

<Tailwind />

<main class="p-4 mx-0">
  <Image 
    {src}
    on:load={onImageLoad}
  />
</main>