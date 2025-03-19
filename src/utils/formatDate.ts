export function formatDate(inputDate: string) {
  const date = new Date(inputDate);
  const options = {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return date.toLocaleDateString("en-GB", options as any);
}
