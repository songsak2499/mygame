// บรรทัดเดียวกับที่คุณส่งมา ใช้ได้เหมือนเดิม
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const background = new Image();
background.src = "images/bg.png";

const playerIdle = new Image();
playerIdle.src = "images/player_idle.png";
const playerRun = new Image();
playerRun.src = "images/player_run.png";
const playerAttack = new Image();
playerAttack.src = "images/player_attack.png";
const playerJump = new Image();
playerJump.src = "images/player_jump.png";

const enemyIdle = new Image();
enemyIdle.src = "images/enemy_idle.png";   // 6 เฟรม, 96px/เฟรม
const enemyAttack = new Image();
enemyAttack.src = "images/attack.png";     // 4 เฟรม, 144px/เฟรม

let playerX = 100, playerY = 0;
let currentFrame = 0, frameTimer = 0;
const frameInterval = 150;

let currentAnimation = "idle";
const animations = {
  idle: { image: playerIdle, totalFrames: 4 },
  run: { image: playerRun, totalFrames: 7 },
  attack: { image: playerAttack, totalFrames: 6 },
  jump: { image: playerJump, totalFrames: 6 }
};

let isRunningLeft = false;
let isRunningRight = false;
let moveSpeed = 2;
let facingLeft = false;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.5, jumpStrength = 10;
let isAttacking = false;
let attackFinished = true;
let lastAnimation = currentAnimation;
let runHoldTimer = 0;

let enemy = {
  x: 600,
  y: 0,
  frame: 0,
  frameTimer: 0,
  frameInterval: 200,
  state: "idle",
  facingLeft: true,
  scale: 1.4
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function draw(deltaTime) {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;
  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;
  const drawHeight = bgOriginalHeight * scale;

  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;
  const groundY = bgY + drawHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);

  // === Enemy ===
  let enemyImage = enemyIdle;
  let frameCount = 6;
  let frameW = 96;
  let frameH = 96;

  if (enemy.state === "attack") {
    enemyImage = enemyAttack;
    frameCount = 4;
    frameW = 144;
  }

  const drawEnemyW = frameW * enemy.scale;
  const drawEnemyH = frameH * enemy.scale;
  enemy.y = groundY - drawEnemyH;

  const sx = Math.min(enemy.frame * frameW, enemyImage.width - frameW);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (enemy.facingLeft) {
    ctx.scale(-1, 1);

    let offsetX = (drawEnemyW - 96 * enemy.scale); // แก้ให้ชดเชยเวลาหันซ้าย
    ctx.drawImage(
      enemyImage,
      sx, 0, frameW, frameH,
      -(enemy.x + drawEnemyW) - offsetX, enemy.y,
      drawEnemyW, drawEnemyH
    );
  } else {
    ctx.drawImage(
      enemyImage,
      sx, 0, frameW, frameH,
      enemy.x, enemy.y,
      drawEnemyW, drawEnemyH
    );
  }
  ctx.restore();

  // === Player ===
  const playerScale = 1.4;
  const drawPlayerW = 100 * playerScale;
  const drawPlayerH = 64 * playerScale;

  if (isJumping) {
    jumpVelocity += gravity;
    playerY += jumpVelocity;
    if (playerY >= groundY - drawPlayerH) {
      playerY = groundY - drawPlayerH;
      isJumping = false;
      jumpVelocity = 0;
    }
  } else {
    playerY = groundY - drawPlayerH;
  }

  if (!isAttacking) {
    if (isRunningRight) {
      playerX += moveSpeed;
      facingLeft = false;
    }
    if (isRunningLeft) {
      playerX -= moveSpeed;
      facingLeft = true;
    }
    playerX = clamp(playerX, 0, canvas.width - drawPlayerW);
  }

  enemy.facingLeft = enemy.x > playerX;

  const anim = animations[currentAnimation];
  const px = Math.min(currentFrame * 100, anim.image.width - 100);

  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(anim.image, px, 0, 100, 64, -(playerX + drawPlayerW), playerY, drawPlayerW, drawPlayerH);
  } else {
    ctx.drawImage(anim.image, px, 0, 100, 64, playerX, playerY, drawPlayerW, drawPlayerH);
  }
  ctx.restore();
}

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  frameTimer += deltaTime;
  runHoldTimer += deltaTime;

  if (frameTimer >= frameInterval) {
    frameTimer = 0;
    currentFrame = (currentFrame + 1) % animations[currentAnimation].totalFrames;

    if (currentAnimation === "attack" && currentFrame === animations.attack.totalFrames - 1) {
      isAttacking = false;
      attackFinished = true;
    }
  }

  const dist = Math.abs(enemy.x - playerX);
  if (dist < 150) {
    if (enemy.state !== "attack") {
      enemy.state = "attack";
      enemy.frame = 0;
    }
  } else {
    enemy.state = "idle";
  }

  enemy.frameTimer += deltaTime;
  if (enemy.frameTimer >= enemy.frameInterval) {
    enemy.frameTimer = 0;
    if (enemy.state === "attack") {
      enemy.frame++;
      if (enemy.frame >= 4) {
        enemy.frame = 0;
        enemy.state = "idle";
      }
    } else {
      enemy.frame = (enemy.frame + 1) % 6;
    }
  }

  if (isJumping) {
    currentAnimation = "jump";
  } else if (isAttacking) {
    currentAnimation = "attack";
    runHoldTimer = 0;
  } else if (isRunningLeft || isRunningRight) {
    currentAnimation = "run";
    runHoldTimer = 0;
  } else if (runHoldTimer > 200) {
    currentAnimation = "idle";
  }

  if (currentAnimation !== lastAnimation) {
    currentFrame = 0;
    frameTimer = 0;
    lastAnimation = currentAnimation;
  }

  draw(deltaTime);
  requestAnimationFrame(gameLoop);
}

let loaded = 0;
function checkStart() {
  loaded++;
  if (loaded >= 7) gameLoop(0);
}
[
  background, playerIdle, playerRun, playerAttack, playerJump,
  enemyIdle, enemyAttack
].forEach(img => img.onload = checkStart);

// Touch controls
document.getElementById("runButton").addEventListener("touchstart", () => isRunningRight = true);
document.getElementById("runButton").addEventListener("touchend", () => isRunningRight = false);

document.getElementById("leftButton").addEventListener("touchstart", () => isRunningLeft = true);
document.getElementById("leftButton").addEventListener("touchend", () => isRunningLeft = false);

document.getElementById("attackButton").addEventListener("touchstart", () => {
  if (!isAttacking) {
    isAttacking = true;
    attackFinished = false;
  }
});

document.getElementById("jumpButton").addEventListener("touchstart", () => {
  if (!isJumping) {
    isJumping = true;
    jumpVelocity = -jumpStrength;
  }
});

document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - (window.lastTouchEnd || 0) <= 300) e.preventDefault();
  window.lastTouchEnd = now;
}, { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
