export default function formatRelativeTime(time: string) {
  return `${time.replace(/^in/g, "")} remaining`
}
