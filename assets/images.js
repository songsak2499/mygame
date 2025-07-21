// โหลดภาพ sprite ทั้งหมดไว้ที่นี่
const loadImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

export const background = loadImage("images/bg.png");

export const playerImages = {
  idle: loadImage("images/player_idle.png"),
  run: loadImage("images/player_run.png"),
  attack: loadImage("images/player_attack.png"),
  jump: loadImage("images/player_jump.png"),
};

export const enemyImages = {
  idle: loadImage("images/enemy_idle.png"),
  attack: loadImage("images/ck.png"),
};

// ฟังก์ชันโหลดครบแล้วเรียก callback
export function loadAllImages(callback) {
  const all = [
    background,
    ...Object.values(playerImages),
    ...Object.values(enemyImages),
  ];
  let loaded = 0;
  all.forEach(img => {
    img.onload = () => {
      loaded++;
      if (loaded === all.length) callback();
    };
  });
}