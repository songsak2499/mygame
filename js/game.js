import { Background } from './background.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// สร้างพื้นหลัง พร้อมใส่ path ภาพที่อัปโหลดไว้ใน repo ของคุณ
const bg = new Background(canvas, 'images/bg.png');

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bg.draw();

  // เพิ่มโค้ดวาดตัวละคร หรือสิ่งอื่น ๆ ที่นี่ในอนาคต

  requestAnimationFrame(gameLoop);
}

gameLoop();