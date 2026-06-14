import { useEffect, useRef, useState } from 'react'

// Animate a KPI number counting up (respects prefers-reduced-motion)
export function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(0)
  const raf = useRef()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return }
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return val
}
