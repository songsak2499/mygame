// === game.js เวอร์ชันเต็ม ===
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
playerIdle.src = "images/player_idle.png"; // 4 เฟรม

const playerRun = new Image();
playerRun.src = "images/player_run.png"; // 7 เฟรม

const playerAttack = new Image();
playerAttack.src = "images/player_attack.png"; // 6 เฟรม

const playerJump = new Image();
playerJump.src = "images/player_jump.png"; // สมมุติ 6 เฟรม

const enemyIdle = new Image();
enemyIdle.src = "images/enemy_idle.png"; // 6 เฟรม, 96px
const enemyAttack = new Image();
enemyAttack.src = "images/attack.png"; // 4 เฟรม, 144px

// === ผู้เล่น ===
let playerX = 100;
let playerY = 0;
let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 150;
let currentAnimation = "idle";
let isRunningLeft = false;
let isRunningRight = false;
let isAttacking = false;
let isJumping = false;
let facingLeft = false;
let jumpVelocity = 0;
let lastAnimation = "idle";
let attackFinished = true;
let runHoldTimer = 0;

const gravity = 0.5;
const jumpStrength = 10;
const moveSpeed = 2;

const animations = {
  idle: { image: playerIdle, totalFrames: 4 },
  run: { image: playerRun, totalFrames: 7 },
  attack: { image: playerAttack, totalFrames: 6 },
  jump: { image: playerJump, totalFrames: 6 }
};

// === ศัตรู ===
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
  const bgScale = canvas.width / background.width;
  const drawHeight = background.height * bgScale;
  const groundY = (canvas.height - drawHeight) / 2 + drawHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, (canvas.height - drawHeight) / 2, canvas.width, drawHeight);

  // === Enemy ===
  let enemyImage = enemyIdle;
  let frameCount = 6;
  let frameW = 96;
  let frameH = 96;
  let offsetX = 0;

  if (enemy.state === "attack") {
    enemyImage = enemyAttack;
    frameCount = 4;
    frameW = 144;
    offsetX = (144 - 96) * enemy.scale;
  }

  const drawW = frameW * enemy.scale;
  const drawH = frameH * enemy.scale;
  const sx = enemy.frame * frameW;
  enemy.y = groundY - drawH;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (enemy.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(enemyImage, sx, 0, frameW, frameH,
      -(enemy.x + drawW) - offsetX, enemy.y,
      drawW, drawH);
  } else {
    ctx.drawImage(enemyImage, sx, 0, frameW, frameH,
      enemy.x, enemy.y,
      drawW, drawH);
  }
  ctx.restore();

  // === Player ===
  const playerScale = 1.4;
  const drawPlayerWidth = 100 * playerScale;
  const drawPlayerHeight = 64 * playerScale;

  if (isJumping) {
    jumpVelocity += gravity;
    playerY += jumpVelocity;
    if (playerY >= groundY - drawPlayerHeight) {
      playerY = groundY - drawPlayerHeight;
      isJumping = false;
      jumpVelocity = 0;
    }
  } else {
    playerY = groundY - drawPlayerHeight;
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
    playerX = clamp(playerX, 0, canvas.width - drawPlayerWidth);
  }

  // ศัตรูหันหน้าเข้า player
  enemy.facingLeft = enemy.x > playerX;

  // วาดผู้เล่น
  const anim = animations[currentAnimation];
  const px = currentFrame * 100;

  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(anim.image, px, 0, 100, 64,
      -(playerX + drawPlayerWidth), playerY,
      drawPlayerWidth, drawPlayerHeight);
  } else {
    ctx.drawImage(anim.image, px, 0, 100, 64,
      playerX, playerY,
      drawPlayerWidth, drawPlayerHeight);
  }
  ctx.restore();
}

// === Game Loop ===
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

  // === Enemy logic ===
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

  // === Player animation state ===
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

// === โหลดภาพครบค่อยเริ่ม ===
let loaded = 0;
function checkStart() {
  loaded++;
  if (loaded >= 7) gameLoop(0);
}
[
  background, playerIdle, playerRun, playerAttack, playerJump,
  enemyIdle, enemyAttack
].forEach(img => img.onload = checkStart);

// === Touch controls ===
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

// ป้องกัน pinch zoom
document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
