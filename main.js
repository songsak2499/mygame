import { loadAllImages } from "./assets/images.js";
import { drawScene } from "./render/draw.js";
import { player, updatePlayer, updatePlayerAnimation } from "./entities/player.js";
import { enemy, updateEnemyAI, updateEnemyAnimation } from "./entities/enemy.js";
import { canvas } from "./core/canvas.js";
import { setupControls } from "./core/input.js";

let lastTime = 0;
let runHoldTimer = 0;
let groundY = 0;

function calculateGroundY() {
  const bgScale = canvas.width / 1920;         // สมมติว่า bg กว้าง 1920px
  const drawHeight = 1080 * bgScale;           // สูงตามสเกล
  groundY = (canvas.height - drawHeight) / 2 + drawHeight;
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // อัปเดตสถานะของผู้เล่นและศัตรู
  updatePlayer(deltaTime, groundY);
  updatePlayerAnimation(deltaTime);

  updateEnemyAI(player.x);
  updateEnemyAnimation(deltaTime);

  // จัดการสถานะ animation ของผู้เล่น
  if (player.isJumping) {
    player.animation = "jump";
    runHoldTimer = 0;
  } else if (player.isAttacking) {
    player.animation = "attack";
    runHoldTimer = 0;
  } else if (player.isRunningLeft || player.isRunningRight) {
    player.animation = "run";
    runHoldTimer = 0;
  } else {
    runHoldTimer += deltaTime;
    if (runHoldTimer > 200) {
      player.animation = "idle";
    }
  }

  // รีเซ็ต frame ถ้ามีการเปลี่ยน animation
  if (player.animation !== player.lastAnimation) {
    player.frame = 0;
    player.frameTimer = 0;
    player.lastAnimation = player.animation;
  }

  try {
    drawScene(); // วาดภาพ
  } catch (err) {
    console.error("Draw error:", err);
  }

  requestAnimationFrame(gameLoop);
}

// โหลดภาพทั้งหมดก่อนเริ่มเกม
loadAllImages(() => {
  setupControls();
  calculateGroundY();
  gameLoop(0);
});
