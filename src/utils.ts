// import cryptoRandomString from 'crypto-random-string';

export function wait(ms = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function randomInt(range = 100) {
  return Math.floor(Math.random() * range);
}

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

export function loadImage(src: string, { hidden = true } = {}) {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.crossOrigin = 'Anonymous'; // To avoid tainted canvas
    image.src = src;
    image.hidden = hidden;
    image.onload = () => resolve(image);
    document.body.appendChild(image);
  });
}

export function randomImageURL() {
  const randomString = Math.random().toString(36).substring(2);
  return `https://picsum.photos/1500/1000?_=${randomString}`;
}

// export function randomImage() {
//   // const url = `https://source.unsplash.com/random?_=${cryptoRandomString({ length: 6 })}`;
//   const url = `https://picsum.photos/1333/1000?_=${cryptoRandomString({ length: 6 })}`;
//   return loadImage(url);
// }

export function saveURL(url: string, { filename = 'video.mp4' } = {}) {
  // const img = canvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.setAttribute('download', filename);
  link.href = url;
  // @ts-ignore
  link.style = 'display: none';
  document.body.appendChild(link);
  link.click();
}

export function download(chunks: any[]) {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}