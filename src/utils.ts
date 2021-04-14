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
