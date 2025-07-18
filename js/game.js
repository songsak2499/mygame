const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ตั้งขนาด canvas ให้เท่ากับหน้าจอ
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// โหลดภาพพื้นหลัง
const background = new Image();
background.src = "../images/bg.png"; // <-- แก้ path ให้ถูกตามโครงสร้างโฟลเดอร์

let bgDrawParams = null;

background.onload = () => {
  // คำนวณขนาดและตำแหน่งที่ต้องใช้
  const scaleRatio = canvas.width / background.width;
  const bgWidth = canvas.width;
  const bgHeight = (background.height * scaleRatio) / 2;
  const bgX = 0;
  const bgY = (canvas.height - bgHeight) / 2;

  bgDrawParams = { bgWidth, bgHeight, bgX, bgY };
  requestAnimationFrame(gameLoop); // เริ่ม loop ตอนนี้
};

function drawBackground() {
  if (bgDrawParams) {
    const { bgWidth, bgHeight, bgX, bgY } = bgDrawParams;
    ctx.drawImage(background, bgX, bgY, bgWidth, bgHeight);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // ถ้าจะใส่ระบบเพิ่มเติม เช่นตัวละคร, UI, ให้เขียนตรงนี้

  requestAnimationFrame(gameLoop);
}
