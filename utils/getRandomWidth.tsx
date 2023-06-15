export default function getRandomWidth(min: number = 60, max: number = 200) {
  const randomWidth = Math.floor(Math.random() * (max - min + 1)) + min
  return randomWidth
}
