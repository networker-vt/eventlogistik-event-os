/** Deterministic demo QR — not a real barcode. */
export function QrStub({ value, size = 168 }: { value: string; size?: number }) {
  const cells = 21
  const bits: boolean[] = []
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  for (let i = 0; i < cells * cells; i++) {
    h ^= i + value.length
    h = Math.imul(h, 16777619)
    const x = i % cells
    const y = Math.floor(i / cells)
    const finder =
      (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)
    if (finder) {
      const ox = x < 7 ? x : x >= cells - 7 ? x - (cells - 7) : x
      const oy = y < 7 ? y : y >= cells - 7 ? y - (cells - 7) : y
      const ring = ox === 0 || oy === 0 || ox === 6 || oy === 6 || (ox >= 2 && ox <= 4 && oy >= 2 && oy <= 4)
      bits.push(ring)
    } else {
      bits.push((h >>> 8) % 3 !== 0)
    }
  }
  const cell = size / cells
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-xl bg-white p-1"
      aria-hidden
    >
      {bits.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={(i % cells) * cell}
            y={Math.floor(i / cells) * cell}
            width={cell}
            height={cell}
            fill="#0b1220"
          />
        ) : null,
      )}
    </svg>
  )
}
