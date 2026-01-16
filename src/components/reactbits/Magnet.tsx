"use client"

import { useRef } from "react"

type Props = {
  strength?: number
  className?: string
  children: React.ReactNode
}

export default function Magnet({ strength = 14, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const tx = (dx / (r.width / 2)) * strength
    const ty = (dy / (r.height / 2)) * strength
    el.style.transform = `translate(${tx}px, ${ty}px)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = `translate(0px, 0px)`
  }

  return (
    <div className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={ref} className="transition-transform duration-200 ease-out will-change-transform">
        {children}
      </div>
    </div>
  )
}
