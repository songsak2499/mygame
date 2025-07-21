// ฟังก์ชัน clamp (กันไม่ให้ค่าหลุดช่วง)
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}