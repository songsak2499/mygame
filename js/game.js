const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ปรับขนาด canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// โหลดพื้นหลัง
const background = new Image();
background.src = "images/bg.png";

// โหลด sprite sheet ตัวละคร (idle 4 เฟรม)
const playerIdle = new Image();
playerIdle.src = "images/player_idle.png"; // ขนาด 400×64 (4 เฟรม)

let playerX = 100;
let playerY = 0;
const frameWidth = 100;
const frameHeight = 64;
let currentFrame = 0;
const totalFrames = 4;
let frameTimer = 0;
const frameInterval = 150; // เปลี่ยนเฟรมทุก 150ms

// วาด
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
  playerY = groundY - frameHeight;

  // วาดเฟรมจาก sprite sheet
  const sx = currentFrame * frameWidth;
  ctx.drawImage(
    playerIdle,
    sx, 0, frameWidth, frameHeight, // ต้นทางใน sprite sheet
    playerX, playerY, frameWidth, frameHeight // ปลายทางบนจอ
  );
}

// ลูปเกม
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  frameTimer += deltaTime;
  if (frameTimer >= frameInterval) {
    frameTimer = 0;
    currentFrame = (currentFrame + 1) % totalFrames;
  }

  draw(deltaTime);
  requestAnimationFrame(gameLoop);
}

// รอโหลดก่อนเริ่ม
let loaded = 0;
background.onload = () => { loaded++; checkStart(); };
playerIdle.onload = () => { loaded++; checkStart(); };

function checkStart() {
  if (loaded === 2) gameLoop(0);
}
