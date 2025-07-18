const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ปรับขนาด canvas ให้เต็มหน้าจอ
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// โหลดภาพพื้นหลัง
const background = new Image();
background.src = "/mygame/images/bg.png";

// โหลด sprite ตัวละคร
const playerIdle = new Image();
playerIdle.src = "/mygame/images/player_idle.png"; // ตัวละครนิ่ง

const playerRun = new Image();
playerRun.src = "/mygame/images/player_idle.png"; // ตัวละครเดิน (ใช้ idle ชั่วคราวถ้าไม่มี)

let currentPlayerImage = playerIdle;

let playerX = 100;
let playerY = 0;
const playerWidth = 64;
const playerHeight = 64;
let playerSpeed = 4;

let movingLeft = false;
let movingRight = false;

// ฟังค์ชันควบคุมปุ่ม
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    movingRight = true;
    currentPlayerImage = playerRun;
  } else if (e.key === "ArrowLeft") {
    movingLeft = true;
    currentPlayerImage = playerRun;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") {
    movingRight = false;
  } else if (e.key === "ArrowLeft") {
    movingLeft = false;
  }

  // หยุดวิ่งเมื่อปล่อยทุกปุ่ม
  if (!movingLeft && !movingRight) {
    currentPlayerImage = playerIdle;
  }
});

// วาดพื้นหลัง + ตัวละคร
function draw() {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;
  const drawHeight = bgOriginalHeight * scale;

  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);

  // วางตัวละครให้ยืนบนพื้น
  const groundY = bgY + drawHeight;
  playerY = groundY - playerHeight;

  // ขยับตัวละคร
  if (movingLeft) {
    playerX -= playerSpeed;
  }
  if (movingRight) {
    playerX += playerSpeed;
  }

  // วาดตัวละคร
  ctx.drawImage(currentPlayerImage, playerX, playerY, playerWidth, playerHeight);
}

// ลูปเกม
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

// รอโหลดทุกภาพก่อนเริ่มเกม
let assetsLoaded = 0;
const totalAssets = 3;

function checkStart() {
  assetsLoaded++;
  if (assetsLoaded === totalAssets) {
    gameLoop();
  }
}

background.onload = checkStart;
playerIdle.onload = checkStart;
playerRun.onload = checkStart;
