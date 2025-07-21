const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const background = new Image();
background.src = "images/bg.png";

const playerIdle = new Image();
playerIdle.src = "images/player_idle.png"; // 4 เฟรม, 100px/เฟรม

const playerRun = new Image();
playerRun.src = "images/player_run.png"; // 7 เฟรม

const playerAttack = new Image();
playerAttack.src = "images/player_attack.png"; // 6 เฟรม

const playerJump = new Image();
playerJump.src = "images/player_jump.png"; // 6 เฟรม

// ศัตรู (ผู้เล่นอีกตัว) sprite
const enemyIdle = new Image();
enemyIdle.src = "images/enemy_idle.png"; // 6 เฟรม, 96px/เฟรม

const enemyAttack = new Image();
enemyAttack.src = "images/ck.png"; // 4 เฟรม, 144px/เฟรม

// === Main player ===
let playerX = 100;
let playerY = 0;
let playerFrame = 0;
let playerFrameTimer = 0;
const playerFrameInterval = 150;
let playerAnimation = "idle";
let playerFacingLeft = false;
let isPlayerRunningLeft = false;
let isPlayerRunningRight = false;
let isPlayerJumping = false;
let isPlayerAttacking = false;
let playerJumpVelocity = 0;
const gravity = 0.5;
const jumpStrength = 10;
const playerMoveSpeed = 2;

// === Enemy player (ศัตรู) ===
let enemy = {
  x: 600,
  y: 0,
  frame: 0,
  frameTimer: 0,
  frameInterval: 200,
  state: "idle", // idle หรือ attack
  facingLeft: true,
  scale: 1.4,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function draw(deltaTime) {
  const bgScale = canvas.width / background.width;
  const drawHeight = background.height * bgScale;
  const groundY = (canvas.height - drawHeight) / 2 + drawHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, (canvas.height - drawHeight) / 2, canvas.width, drawHeight);

  // --- วาด enemy (ผู้เล่นอีกตัว) ---
  let enemyImage = enemyIdle;
  let frameCount = 6;
  let frameW = 96;
  let frameH = 96;
  let offsetX = 0;

  if (enemy.state === "attack") {
    enemyImage = enemyAttack;
    frameCount = 4;
    frameW = 144;
    offsetX = (frameW - 96) * enemy.scale; // ชดเชยตำแหน่งตอนฟลิปภาพ
  }

  const drawEnemyW = frameW * enemy.scale;
  const drawEnemyH = frameH * enemy.scale;
  enemy.y = groundY - drawEnemyH;
  const sxEnemy = enemy.frame * frameW;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (enemy.facingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      enemyImage,
      sxEnemy, 0, frameW, frameH,
      -(enemy.x + drawEnemyW) - offsetX, enemy.y,
      drawEnemyW, drawEnemyH
    );
  } else {
    ctx.drawImage(
      enemyImage,
      sxEnemy, 0, frameW, frameH,
      enemy.x, enemy.y,
      drawEnemyW, drawEnemyH
    );
  }
  ctx.restore();

  // --- วาด player ---
  const playerScale = 1.4;
  const drawPlayerW = 100 * playerScale;
  const drawPlayerH = 64 * playerScale;

  if (isPlayerJumping) {
    playerJumpVelocity += gravity;
    playerY += playerJumpVelocity;
    if (playerY >= groundY - drawPlayerH) {
      playerY = groundY - drawPlayerH;
      isPlayerJumping = false;
      playerJumpVelocity = 0;
    }
  } else {
    playerY = groundY - drawPlayerH;
  }

  if (!isPlayerAttacking) {
    if (isPlayerRunningRight) {
      playerX += playerMoveSpeed;
      playerFacingLeft = false;
    }
    if (isPlayerRunningLeft) {
      playerX -= playerMoveSpeed;
      playerFacingLeft = true;
    }
    playerX = clamp(playerX, 0, canvas.width - drawPlayerW);
  }

  // enemy หันหน้าเข้าหาผู้เล่น
  enemy.facingLeft = enemy.x > playerX;

  // player animation frame
  const playerAnimData = {
    idle: { image: playerIdle, totalFrames: 4 },
    run: { image: playerRun, totalFrames: 7 },
    attack: { image: playerAttack, totalFrames: 6 },
    jump: { image: playerJump, totalFrames: 6 },
  };

  const playerAnim = playerAnimData[playerAnimation];
  const pxPlayer = Math.min(playerFrame * 100, playerAnim.image.width - 100);

  ctx.save();
  if (playerFacingLeft) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      playerAnim.image,
      pxPlayer, 0, 100, 64,
      -(playerX + drawPlayerW), playerY,
      drawPlayerW, drawPlayerH
    );
  } else {
    ctx.drawImage(
      playerAnim.image,
      pxPlayer, 0, 100, 64,
      playerX, playerY,
      drawPlayerW, drawPlayerH
    );
  }
  ctx.restore();
}

let lastTime = 0;
let runHoldTimer = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // player frame update
  playerFrameTimer += deltaTime;
  runHoldTimer += deltaTime;
  if (playerFrameTimer >= playerFrameInterval) {
    playerFrameTimer = 0;
    playerFrame = (playerFrame + 1) % (playerAnimation === "attack" ? 6 : playerAnimData[playerAnimation].totalFrames);
    if (playerAnimation === "attack" && playerFrame === 5) {
      isPlayerAttacking = false;
    }
  }

  // enemy AI logic: โจมตีเมื่อเข้าใกล้ player
  const dist = Math.abs(enemy.x - playerX);
  if (dist < 150) {
    if (enemy.state !== "attack") {
      enemy.state = "attack";
      enemy.frame = 0;
    }
  } else {
    enemy.state = "idle";
  }

  // enemy frame update
  enemy.frameTimer += deltaTime;
  if (enemy.frameTimer >= enemy.frameInterval) {
    enemy.frameTimer = 0;
    if (enemy.state === "attack") {
      enemy.frame++;
      if (enemy.frame >= 4) {
        enemy.frame = 0;
        enemy.state = "idle";
      }
    } else {
      enemy.frame = (enemy.frame + 1) % 6;
    }
  }

  // player animation state update
  if (isPlayerJumping) {
    playerAnimation = "jump";
  } else if (isPlayerAttacking) {
    playerAnimation = "attack";
    runHoldTimer = 0;
  } else if (isPlayerRunningLeft || isPlayerRunningRight) {
    playerAnimation = "run";
    runHoldTimer = 0;
  } else if (runHoldTimer > 200) {
    playerAnimation = "idle";
  }

  // reset frame on animation change
  if (playerAnimation !== lastAnimation) {
    playerFrame = 0;
    playerFrameTimer = 0;
    lastAnimation = playerAnimation;
  }

  draw(deltaTime);
  requestAnimationFrame(gameLoop);
}

// โหลดภาพครบเริ่มเกม
let loaded = 0;
function checkStart() {
  loaded++;
  if (loaded >= 7) gameLoop(0);
}
[
  background, playerIdle, playerRun, playerAttack, playerJump,
  enemyIdle, enemyAttack
].forEach(img => img.onload = checkStart);

// Controls
document.getElementById("runButton").addEventListener("touchstart", () => isPlayerRunningRight = true);
document.getElementById("runButton").addEventListener("touchend", () => isPlayerRunningRight = false);

document.getElementById("leftButton").addEventListener("touchstart", () => isPlayerRunningLeft = true);
document.getElementById("leftButton").addEventListener("touchend", () => isPlayerRunningLeft = false);

document.getElementById("attackButton").addEventListener("touchstart", () => {
  if (!isPlayerAttacking) {
    isPlayerAttacking = true;
  }
});

document.getElementById("jumpButton").addEventListener("touchstart", () => {
  if (!isPlayerJumping) {
    isPlayerJumping = true;
    playerJumpVelocity = -jumpStrength;
  }
});

// ป้องกัน pinch zoom
document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
