<script lang="ts">
  import netherlands from './assets/netherlands.jpeg'
  import { randomImageURL } from './utils';
  import Image from './lib/Image.svelte';
  import Tailwind from './Tailwind.svelte';

  const src = randomImageURL();
</script>

<Tailwind />

<main class="text-center p-4 mx-0">
  <Image {src} />
</main>