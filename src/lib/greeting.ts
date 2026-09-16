export function timeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function greetingFor(name: string): string {
  const first = name.trim() || "there";
  switch (timeOfDay()) {
    case "morning":
      return `Good morning, ${first}`;
    case "afternoon":
      return `Good afternoon, ${first}`;
    case "evening":
      return `Good evening, ${first}`;
  }
}
