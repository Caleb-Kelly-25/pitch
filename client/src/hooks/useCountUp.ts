import { useState, useEffect } from "react"

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(0)
    if (target === 0) return
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
