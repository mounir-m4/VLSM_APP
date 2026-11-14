export const SUBNET_COLORS = [
  '#38bdf8',
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#f472b6',
  '#22d3ee',
  '#f97316',
  '#84cc16',
  '#e879f9',
  '#60a5fa',
  '#facc15',
]

export function colorForIndex(index) {
  return SUBNET_COLORS[((index % SUBNET_COLORS.length) + SUBNET_COLORS.length) % SUBNET_COLORS.length]
}
