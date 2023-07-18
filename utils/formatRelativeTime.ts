export default function formatRelativeTime(time: string) {
  if (time === "tomorrow") return "tomorrow"
  return `${time.replace(/^in/g, "")} remaining`
}
