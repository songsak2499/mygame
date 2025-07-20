const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ปรับขนาด canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// โหลดภาพ
const background = new Image();
background.src = "images/bg.png";

const playerIdle = new Image();
playerIdle.src = "images/player_idle.png"; // 400x64 (4 เฟรม)

const playerRun = new Image();
playerRun.src = "images/player_run.png"; // 700x64 (7 เฟรม)

const playerAttack = new Image();
playerAttack.src = "images/player_attack.png"; // 600x64 (6 เฟรม)

const playerJump = new Image();
playerJump.src = "images/player_jump.png"; // 6 เฟรม (สมมุติ)

const enemyIdle = new Image();
enemyIdle.src = "images/enemy_idle.png"; // 576x96 (6 เฟรม, 96px/เฟรม)

const enemyAttack = new Image();
enemyAttack.src = "images/attack.png"; // 576x96 (4 เฟรม, 144px/เฟรม)

let playerX = 100;
let playerY = 0;

let frameWidth = 100;
let frameHeight = 64;
let currentFrame = 0;
let frameTimer = 0;
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
const gravity = 0.5;
const jumpStrength = 10;

let isAttacking = false;
let attackFinished = true;

let lastAnimation = currentAnimation;
let runHoldTimer = 0;

// ข้อมูลศัตรู
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
  let frameWidth = 96;
  let frameHeight = 96;

  if (enemy.state === "attack") {
    enemyImage = enemyAttack;
    frameCount = 4;
    frameWidth = 144;
  }

  const drawEnemyWidth = frameWidth * enemy.scale;
  const drawEnemyHeight = frameHeight * enemy.scale;

  enemy.y = groundY - drawEnemyHeight;

  const sx = Math.min(enemy.frame * frameWidth, enemyImage.width - frameWidth);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (enemy.facingLeft) {
    ctx.scale(-1, 1);

    // แก้ไข offsetX ให้ชดเชยตำแหน่งเวลาฟลิปเพื่อไม่ให้ภาพซ้ำซ้อน
    // คำนวณความต่างของความกว้างเฟรมระหว่าง attack กับ idle แล้วคูณด้วย scale
    let offsetX = 0;
    if (enemy.state === "attack") {
      offsetX = (frameWidth - 96) * enemy.scale; // (144 - 96) * scale
    }

    // วาดภาพ โดยลบ offsetX เพื่อปรับตำแหน่งให้ถูกต้อง
    ctx.drawImage(
      enemyImage,
      sx, 0, frameWidth, frameHeight,
      -(enemy.x + drawEnemyWidth) - offsetX, enemy.y,
      drawEnemyWidth, drawEnemyHeight
    );
  } else {
    // ตอนหันขวา วาดภาพปกติไม่ต้องชดเชย offsetX
    ctx.drawImage(
      enemyImage,
      sx, 0, frameWidth, frameHeight,
      enemy.x, enemy.y,
      drawEnemyWidth, drawEnemyHeight
    );
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

  enemy.facingLeft = enemy.x > playerX;

  const anim = animations[currentAnimation];
  const px = Math.min(currentFrame * 100, anim.image.width - 100);

  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      anim.image,
      px, 0, 100, 64,
      -(playerX + drawPlayerWidth), playerY,
      drawPlayerWidth, drawPlayerHeight
    );
  } else {
    ctx.drawImage(
      anim.image,
      px, 0, 100, 64,
      playerX, playerY,
      drawPlayerWidth, drawPlayerHeight
    );
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

  // Enemy logic
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

  // Player anim state
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

// โหลดครบแล้วเริ่มเกม
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

// ปิด zoom, scroll
document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - (window.lastTouchEnd || 0) <= 300) e.preventDefault();
  window.lastTouchEnd = now;
}, { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
