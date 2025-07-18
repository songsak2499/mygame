const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// โหลดภาพพื้นหลังและ sprite
const background = new Image();
background.src = "images/bg.png";

const playerIdle = new Image();
playerIdle.src = "images/player_idle.png"; // 400×64 (4 เฟรม)

const playerRun = new Image();
playerRun.src = "images/player_run.png";  // 700×64 (7 เฟรม)

let playerX = 100;
let playerY = 0;

const frameWidth = 100;
const frameHeight = 64;
let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 150;

// animation control
let currentAnimation = "idle";
const animations = {
  idle: { image: playerIdle, totalFrames: 4 },
  run: { image: playerRun, totalFrames: 7 }
};

// ✅ ควบคุมทิศทาง
let isRunningLeft = false;
let isRunningRight = false;
let moveSpeed = 2;
let facingLeft = false; // ไว้สำหรับพลิกภาพถ้าจะใช้ภายหลัง

// วาดฉากและตัวละคร
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

  playerY = groundY - drawPlayerHeight;

  const anim = animations[currentAnimation];
  const sx = currentFrame * frameWidth;

  // ✅ อัปเดตตำแหน่ง
  if (isRunningRight) {
    playerX += moveSpeed;
    facingLeft = false;
  }
  if (isRunningLeft) {
    playerX -= moveSpeed;
    facingLeft = true;
  }

  // ✅ วาดตัวละคร (พลิกภาพหากหันซ้าย)
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

// ลูปเกม
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  frameTimer += deltaTime;
  const totalFrames = animations[currentAnimation].totalFrames;

  if (frameTimer >= frameInterval) {
    frameTimer = 0;
    currentFrame = (currentFrame + 1) % totalFrames;
  }

  // ตั้งแอนิเมชันตามสถานะ
  if (isRunningLeft || isRunningRight) {
    currentAnimation = "run";
  } else {
    currentAnimation = "idle";
  }

  draw(deltaTime);
  requestAnimationFrame(gameLoop);
}

// โหลดครบ 3 รูปแล้วเริ่ม
let loaded = 0;
function checkStart() {
  loaded++;
  if (loaded === 3) gameLoop(0);
}
background.onload = checkStart;
playerIdle.onload = checkStart;
playerRun.onload = checkStart;

// ✅ ปุ่มขวา
const runBtn = document.getElementById("runButton");
runBtn.addEventListener("touchstart", () => {
  isRunningRight = true;
});
runBtn.addEventListener("touchend", () => {
  isRunningRight = false;
});

// ✅ ปุ่มซ้าย
const leftBtn = document.getElementById("leftButton");
leftBtn.addEventListener("touchstart", () => {
  isRunningLeft = true;
});
leftBtn.addEventListener("touchend", () => {
  isRunningLeft = false;
});
