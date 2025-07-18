export class Background {
  constructor(canvas, imageSrc) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = new Image();
    this.image.src = imageSrc;

    this.loaded = false;
    this.image.onload = () => {
      this.loaded = true;
    };
  }

  draw() {
    if (!this.loaded) return;

    const bgOriginalWidth = this.image.width;
    const bgOriginalHeight = this.image.height;

    // ให้ภาพเต็มความกว้าง canvas
    const bgDrawWidth = this.canvas.width;
    const bgScaleRatio = bgDrawWidth / bgOriginalWidth;

    // ลดความสูงลงประมาณครึ่งหนึ่ง (ปรับได้)
    const bgDrawHeight = (bgOriginalHeight * bgScaleRatio) / 2;

    // วางภาพให้อยู่กึ่งกลางแนวตั้ง
    const bgX = 0;
    const bgY = (this.canvas.height - bgDrawHeight) / 2;

    this.ctx.drawImage(this.image, bgX, bgY, bgDrawWidth, bgDrawHeight);
  }
}