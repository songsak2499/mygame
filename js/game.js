const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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

  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;
  const drawHeight = (bgOriginalHeight * scale) / 2; // ลดสูงลงครึ่งหนึ่ง

  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);
}
