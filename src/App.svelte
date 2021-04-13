<script lang="ts">
  import netherlands from './assets/netherlands.jpeg'
  import Image from './lib/Image.svelte';
  import Tailwind from './Tailwind.svelte';
</script>

<Tailwind />

<main class="text-center p-4 mx-0">
  <Image src={netherlands} />
</main>