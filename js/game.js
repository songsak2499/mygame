const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const background = new Image();
background.src = "images/bg.png"; // เส้นทางภาพพื้นหลัง

background.onload = () => {
  draw();
};

function draw() {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  // ความกว้างเต็มหน้าจอ
  const drawWidth = canvas.width;
  const scale = drawWidth / bgOriginalWidth;

  // ความสูงลดลงเหลือ 50% ของภาพพื้นหลัง (หรือตามต้องการ)
  const drawHeight = (bgOriginalHeight * scale) / 2;

  // วางแนวตั้งตรงกลาง
  const bgX = 0;
  const bgY = (canvas.height - drawHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, bgX, bgY, drawWidth, drawHeight);
}
