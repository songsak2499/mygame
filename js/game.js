const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 1.2;  // เพิ่มความสูง canvas เป็น 120% ของหน้าจอ
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const background = new Image();
background.src = "../images/bg.png"; // เพราะ game.js อยู่ใน js/ โฟลเดอร์ต้องย้อนกลับ 1 ชั้น

background.onload = () => {
  draw();
};

function draw() {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  // ปรับสเกลภาพให้เต็มความกว้าง canvas
  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;

  // ปรับความสูงของภาพพื้นหลังตาม scale และแบ่งครึ่ง (หรือเปลี่ยน 0.5 เป็นตามต้องการ)
  const drawHeight = bgOriginalHeight * scale * 0.5;

  const bgX = 0;
  // วางภาพให้อยู่กึ่งกลางแนวตั้ง (ใน canvas ที่สูงขึ้น)
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);
}
