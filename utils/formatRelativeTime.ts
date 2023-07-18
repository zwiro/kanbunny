export default function formatRelativeTime(time: string) {
  if (time === "tomorrow" || time === "this minute") return time
  return `${time.replace(/^in/g, "")} remaining`
}
