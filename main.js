import { loadAllImages } from "./assets/images.js";
import { drawScene } from "./render/draw.js";
import { player, updatePlayer, updatePlayerAnimation } from "./entities/player.js";
import { enemy, updateEnemyAI, updateEnemyAnimation } from "./entities/enemy.js";
import { canvas } from "./core/canvas.js";
import { setupControls } from "./core/input.js";

let lastTime = 0;
let runHoldTimer = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  const bgScale = canvas.width / 1920; // Assume background width is 1920
  const drawHeight = 1080 * bgScale;
  const groundY = (canvas.height - drawHeight) / 2 + drawHeight;

  updatePlayer(deltaTime, groundY);
  updatePlayerAnimation(deltaTime);

  updateEnemyAI(player.x);
  updateEnemyAnimation(deltaTime);

  // animation state logic
  if (player.isJumping) player.animation = "jump";
  else if (player.isAttacking) {
    player.animation = "attack";
    runHoldTimer = 0;
  } else if (player.isRunningLeft || player.isRunningRight) {
    player.animation = "run";
    runHoldTimer = 0;
  } else if (runHoldTimer > 200) {
    player.animation = "idle";
  }

  if (player.animation !== player.lastAnimation) {
    player.frame = 0;
    player.frameTimer = 0;
    player.lastAnimation = player.animation;
  }

  drawScene();
  requestAnimationFrame(gameLoop);
}

loadAllImages(() => {
  setupControls();
  gameLoop(0);
});