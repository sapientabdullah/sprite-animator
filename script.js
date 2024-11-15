import { characterAnimations } from "./constants.js";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const scaleFactor = 0.25;
const characterDimensions = {
  width: 796 * scaleFactor,
  height: 719 * scaleFactor,
};

const characterState = {
  position: {
    startX: 0,
    startY: CANVAS_HEIGHT - 395,
  },
  facingRight: true,
  idle: true,
  running: false,
  jumping: false,
  punching: false,
  frameCount: 0,
  velocityY: 0,
  gravity: 0.8,
  jumpPower: -10,
};

const animationSettings = {
  idleFrameIndex: 0,
  punchFrameIndex: 0,
  runFrameIndex: 0,
  jumpFrameIndex: 0,
  idleFrameRate: 3,
  punchFrameRate: 3,
  jumpFrameRate: 0.5,
  runFrameRate: 2,
};

const preloadedImages = {};
function preloadImages() {
  characterAnimations.forEach((animationGroup) => {
    for (const state in animationGroup) {
      animationGroup[state].forEach((src) => {
        const img = new Image();
        img.src = src;
        preloadedImages[src] = img;
      });
    }
  });
}
preloadImages();

let lastFrameTime = 0;

function resizeCanvas() {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

window.addEventListener("resize", () => {
  clearTimeout(resizeCanvas.timeout);
  resizeCanvas.timeout = setTimeout(resizeCanvas, 200);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  const element = document.querySelector('[data-keyboard-key="' + key + '"]');
  if (element) {
    element.classList.add("active");
  }

  if (key === "d") {
    characterState.idle = false;
    characterState.running = true;
    characterState.facingRight = true;
    moveRight();
  } else if (key === "a") {
    characterState.idle = false;
    characterState.running = true;
    characterState.facingRight = false;
    moveLeft();
  } else if (key === "p" && !characterState.punching) {
    punch();
  } else if (key === " " && !characterState.jumping) {
    jump();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key;

  const element = document.querySelector('[data-keyboard-key="' + key + '"]');
  if (element) {
    element.classList.remove("active");
  }

  if (key === "d" || key === "a") {
    characterState.running = false;
    characterState.idle = true;
  }
});

function moveRight() {
  if (
    characterState.position.startX + characterDimensions.width <
    CANVAS_WIDTH
  ) {
    characterState.position.startX += 10;
  }
}

function moveLeft() {
  if (characterState.position.startX > 0) {
    characterState.position.startX -= 10;
  }
}

function jump() {
  if (!characterState.jumping) {
    characterState.idle = false;
    characterState.jumping = true;
    characterState.velocityY = characterState.jumpPower;
    animationSettings.jumpFrameIndex = 0;
  }
}

function punch() {
  characterState.idle = false;
  characterState.punching = true;
  animationSettings.punchFrameIndex = 0;
}

function updateAnimationFrames() {
  if (characterState.punching) {
    if (characterState.frameCount % animationSettings.punchFrameRate === 0) {
      animationSettings.punchFrameIndex++;
      if (
        animationSettings.punchFrameIndex >= characterAnimations[1].punch.length
      ) {
        characterState.punching = false;
        characterState.idle = true;
        animationSettings.punchFrameIndex = 0;
      }
    }
  } else if (characterState.running) {
    if (characterState.frameCount % animationSettings.runFrameRate === 0) {
      animationSettings.runFrameIndex =
        (animationSettings.runFrameIndex + 1) %
        characterAnimations[3].run.length;
    }
  } else if (characterState.jumping) {
    if (characterState.frameCount % animationSettings.jumpFrameRate === 0) {
      animationSettings.jumpFrameIndex++;
      if (
        animationSettings.jumpFrameIndex >= characterAnimations[2].jump.length
      ) {
        animationSettings.jumpFrameIndex =
          characterAnimations[2].jump.length - 1;
      }
    }

    characterState.position.startY += characterState.velocityY;
    characterState.velocityY += characterState.gravity;

    if (characterState.position.startY >= CANVAS_HEIGHT - 395) {
      characterState.position.startY = CANVAS_HEIGHT - 395;
      characterState.jumping = false;
      characterState.idle = true;
      characterState.velocityY = 0;
    }
  } else if (characterState.idle) {
    if (characterState.frameCount % animationSettings.idleFrameRate === 0) {
      animationSettings.idleFrameIndex =
        (animationSettings.idleFrameIndex + 1) %
        characterAnimations[0].idle.length;
    }
  }

  characterState.frameCount++;
}

function drawCharacter() {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.save();

  let currentAnimation;

  if (characterState.punching) {
    currentAnimation =
      characterAnimations[1].punch[animationSettings.punchFrameIndex];
  } else if (characterState.jumping) {
    currentAnimation =
      characterAnimations[2].jump[animationSettings.jumpFrameIndex];
  } else if (characterState.running) {
    currentAnimation =
      characterAnimations[3].run[animationSettings.runFrameIndex];
  } else {
    currentAnimation =
      characterAnimations[0].idle[animationSettings.idleFrameIndex];
  }

  const imageToDraw = preloadedImages[currentAnimation];

  if (!characterState.facingRight) {
    context.scale(-1, 1);
    context.drawImage(
      imageToDraw,
      -characterState.position.startX - characterDimensions.width,
      characterState.position.startY,
      characterDimensions.width,
      characterDimensions.height
    );
  } else {
    context.drawImage(
      imageToDraw,
      characterState.position.startX,
      characterState.position.startY,
      characterDimensions.width,
      characterDimensions.height
    );
  }
  context.restore();
}

function animate(currentTime) {
  const elapsed = currentTime - lastFrameTime;
  if (elapsed > 1000 / 60) {
    lastFrameTime = currentTime;
    updateAnimationFrames();
    drawCharacter();
  }
  requestAnimationFrame(animate);
}

animate(0);
