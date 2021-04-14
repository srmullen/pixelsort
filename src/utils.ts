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