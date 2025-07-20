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

// Enemy sprites
const enemyIdle = new Image();
enemyIdle.src = "images/enemy_idle.png"; // 6 เฟรม x 96px

const enemyAttack = new Image();
enemyAttack.src = "images/attack.png";   // 4 เฟรม x 144px

// Player config
let playerX = 100;
let playerY = 0;
const frameWidth = 100;
const frameHeight = 64;
let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 150;

let currentAnimation = "idle";
let lastAnimation = currentAnimation;

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
let runHoldTimer = 0;

// Enemy config
let enemy = {
  x: 600,
  y: 0,
  frame: 0,
  frameTimer: 0,
  frameInterval: 200,
  state: "idle", // idle or attack
  facingLeft: true,
  scale: 1.4,

  idle: { width: 96, height: 96, totalFrames: 6 },
  attack: { width: 144, height: 96, totalFrames: 4 }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function draw(deltaTime) {
  const bgScale = canvas.width / background.width;
  const bgHeight = background.height * bgScale;
  const bgY = (canvas.height - bgHeight) / 2;
  const groundY = bgY + bgHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, bgY, canvas.width, bgHeight);

  // ==== Draw Enemy ====
  const state = enemy.state;
  const sprite = state === "attack" ? enemy.attack : enemy.idle;
  const enemyImage = state === "attack" ? enemyAttack : enemyIdle;

  const drawEnemyWidth = sprite.width * enemy.scale;
  const drawEnemyHeight = sprite.height * enemy.scale;
  enemy.y = groundY - drawEnemyHeight;

  const enemySx = Math.min(enemy.frame * sprite.width, enemyImage.width - sprite.width);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (enemy.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      enemyImage,
      enemySx, 0, sprite.width, sprite.height,
      -(enemy.x + drawEnemyWidth), enemy.y,
      drawEnemyWidth, drawEnemyHeight
    );
  } else {
    ctx.drawImage(
      enemyImage,
      enemySx, 0, sprite.width, sprite.height,
      enemy.x, enemy.y,
      drawEnemyWidth, drawEnemyHeight
    );
  }
  ctx.restore();

  // ==== Draw Player ====
  const drawPlayerWidth = frameWidth * 1.4;
  const drawPlayerHeight = frameHeight * 1.4;

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
  const sx = Math.min(currentFrame * frameWidth, anim.image.width - frameWidth);

  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(anim.image, sx, 0, frameWidth, frameHeight, -(playerX + drawPlayerWidth), playerY, drawPlayerWidth, drawPlayerHeight);
  } else {
    ctx.drawImage(anim.image, sx, 0, frameWidth, frameHeight, playerX, playerY, drawPlayerWidth, drawPlayerHeight);
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

  const distance = Math.abs(enemy.x - playerX);
  if (distance < 150) {
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
    const sprite = enemy.state === "attack" ? enemy.attack : enemy.idle;
    enemy.frame++;
    if (enemy.frame >= sprite.totalFrames) {
      enemy.frame = 0;
      if (enemy.state === "attack") {
        enemy.state = "idle";
      }
    }
  }

  if (isJumping) currentAnimation = "jump";
  else if (isAttacking) currentAnimation = "attack";
  else if (isRunningLeft || isRunningRight) currentAnimation = "run";
  else if (runHoldTimer > 200) currentAnimation = "idle";

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
  if (loaded === 8) gameLoop(0);
}
[background, playerIdle, playerRun, playerAttack, playerJump, enemyIdle, enemyAttack].forEach(img => img.onload = checkStart);

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

// Prevent zoom & scroll
document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchend", e => {
  if (new Date().getTime() - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = new Date().getTime();
}, { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

let lastTouchEnd = 0;
