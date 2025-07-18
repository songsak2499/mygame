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
playerIdle.src = "images/player_idle.png"; // 400×64 (4 เฟรม)

const playerRun = new Image();
playerRun.src = "images/player_run.png";  // 700×64 (7 เฟรม)

const playerAttack = new Image();
playerAttack.src = "images/player_attack.png"; // 600×64 (6 เฟรม)

const playerJump = new Image();
playerJump.src = "images/player_jump.png";

let playerX = 100;
let playerY = 0;

const frameWidth = 100;
const frameHeight = 64;
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

let runHoldTimer = 0;

let lastAnimation = currentAnimation;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function draw(deltaTime) {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;
  const drawHeight = bgOriginalHeight * scale;

  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);

  const groundY = bgY + drawHeight;

  const scaleFactor = 1.4;
  const drawPlayerWidth = frameWidth * scaleFactor;
  const drawPlayerHeight = frameHeight * scaleFactor;

  // เคลื่อนที่แนว Y ขณะกระโดด
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

  // เคลื่อนที่แนว X ถ้าไม่โจมตี
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

  // เลือก sprite animation ปัจจุบัน
  const anim = animations[currentAnimation];
  const sx = Math.min(currentFrame * frameWidth, anim.image.width - frameWidth);

  ctx.save();
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      anim.image,
      sx, 0, frameWidth, frameHeight,
      -(playerX + drawPlayerWidth), playerY,
      drawPlayerWidth, drawPlayerHeight
    );
  } else {
    ctx.drawImage(
      anim.image,
      sx, 0, frameWidth, frameHeight,
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
    frameTimer -= frameInterval;
    currentFrame = (currentFrame + 1) % animations[currentAnimation].totalFrames;

    // จบแอนิเมชันโจมตีเมื่อถึงเฟรมสุดท้าย
    if (currentAnimation === "attack" && currentFrame === animations.attack.totalFrames - 1) {
      isAttacking = false;
      attackFinished = true;
    }
  }

  // กำหนดแอนิเมชันตามสถานะ
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

  // รีเซ็ตเฟรมถ้าแอนิเมชันเปลี่ยน
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
  if (loaded === 5) gameLoop(0);
}
background.onload = checkStart;
playerIdle.onload = checkStart;
playerRun.onload = checkStart;
playerAttack.onload = checkStart;
playerJump.onload = checkStart;

// ปุ่มควบคุมเดินขวา
const runBtn = document.getElementById("runButton");
runBtn.addEventListener("touchstart", () => { isRunningRight = true; });
runBtn.addEventListener("touchend", () => { isRunningRight = false; });
runBtn.addEventListener("touchcancel", () => { isRunningRight = false; });

// ปุ่มควบคุมเดินซ้าย
const leftBtn = document.getElementById("leftButton");
leftBtn.addEventListener("touchstart", () => { isRunningLeft = true; });
leftBtn.addEventListener("touchend", () => { isRunningLeft = false; });
leftBtn.addEventListener("touchcancel", () => { isRunningLeft = false; });

// ปุ่มโจมตี
const attackBtn = document.getElementById("attackButton");
attackBtn.addEventListener("touchstart", () => {
  if (!isAttacking) {
    isAttacking = true;
    attackFinished = false;
  }
});
attackBtn.addEventListener("touchend", () => { });
attackBtn.addEventListener("touchcancel", () => { });

// ปุ่มกระโดด
const jumpBtn = document.getElementById("jumpButton");
jumpBtn.addEventListener("touchstart", () => {
  if (!isJumping) {
    isJumping = true;
    jumpVelocity = -jumpStrength;
  }
});

// ปิด pinch zoom
document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
}, { passive: false });

// ปิด double tap zoom
let lastTouchEnd = 0;
document.addEventListener("touchend", function (event) {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

// ปิด scroll ด้วยนิ้ว
document.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });