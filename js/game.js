const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ปรับขนาด canvas เท่าขนาดหน้าจอ
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// โหลดภาพพื้นหลัง
const background = new Image();
background.src = "/mygame/images/bg.png"; // ย้อนออกจากโฟลเดอร์ js กลับไปที่ images

background.onload = () => {
  draw();
};

function draw() {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  // ขยายภาพให้เต็มความกว้างหน้าจอ
  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;
  const drawHeight = bgOriginalHeight * scale;

  // ให้ภาพอยู่กลางแนวตั้ง
  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);
}
