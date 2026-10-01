export default function Chip({ variant = "neutral", children }) {
  return <span className={`chip chip-${variant}`}>{children}</span>;
}
