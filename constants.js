export const characterAnimations = [
  {
    idle: Array.from(
      { length: 21 },
      (_, i) => `assets/Character/idle/${i}.png`
    ),
  },
  {
    punch: Array.from(
      { length: 10 },
      (_, i) => `assets/Character/punch/${i}.png`
    ),
  },
  {
    jump: Array.from(
      { length: 33 },
      (_, i) => `assets/Character/jump/${i}.png`
    ),
  },
  {
    run: Array.from({ length: 36 }, (_, i) => `assets/Character/run/${i}.png`),
  },
];
