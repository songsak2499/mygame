import { ctx, canvas } from "../core/canvas.js";
import { background, playerImages, enemyImages } from "../assets/images.js";
import { player } from "../entities/player.js";
import { enemy } from "../entities/enemy.js";

export function drawScene() {
  const bgScale = canvas.width / background.width;
  const drawHeight = background.height * bgScale;
  const groundY = (canvas.height - drawHeight) / 2 + drawHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, (canvas.height - drawHeight) / 2, canvas.width, drawHeight);

  // Enemy
  let enemyImg = enemy.state === "attack" ? enemyImages.attack : enemyImages.idle;
  let frameW = enemy.state === "attack" ? 144 : 96;
  let frameH = 96;
  let offsetX = enemy.state === "attack" ? (frameW - 96) * enemy.scale : 0;
  const drawW = frameW * enemy.scale;
  const drawH = frameH * enemy.scale;
  enemy.y = groundY - drawH;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (enemy.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(enemyImg, enemy.frame * frameW, 0, frameW, frameH,
      -(enemy.x + drawW) - offsetX, enemy.y, drawW, drawH);
  } else {
    ctx.drawImage(enemyImg, enemy.frame * frameW, 0, frameW, frameH,
      enemy.x, enemy.y, drawW, drawH);
  }
  ctx.restore();

  // Player
  const pImg = playerImages[player.animation];
  const frameWPlayer = 100;
  const drawWPlayer = frameWPlayer * player.scale;
  const drawHPlayer = 64 * player.scale;
  const sx = Math.min(player.frame * 100, pImg.width - 100);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (player.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(pImg, sx, 0, 100, 64,
      -(player.x + drawWPlayer), player.y, drawWPlayer, drawHPlayer);
  } else {
    ctx.drawImage(pImg, sx, 0, 100, 64,
      player.x, player.y, drawWPlayer, drawHPlayer);
  }
  ctx.restore();
}
