export const MOODS = [
  { id: "fired-up", label: "Fired up", hex: "#c8391e" },
  { id: "calm", label: "Calm", hex: "#e5b000" },
  { id: "energetic", label: "Energetic", hex: "#b9510d" },
  { id: "focus", label: "Focus", hex: "#2f5bd3" },
  { id: "chill", label: "Chill", hex: "#1e7a52" },
  { id: "creative", label: "Creative", hex: "#6b3fb5" },
];

export function moodLabel(id) {
  return MOODS.find((m) => m.id === id)?.label ?? id;
}
