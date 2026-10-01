export function randomId(prefix) {
  const part = Math.random().toString(36).slice(2, 9);
  return prefix ? `${prefix}_${part}` : part;
}
