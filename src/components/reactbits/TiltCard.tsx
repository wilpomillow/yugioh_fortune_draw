"use client"

import { useRef } from "react"

type Props = {
  className?: string
  children: React.ReactNode
}

export default function TiltCard({ className = "", children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const rotY = (px - 0.5) * 10
    const rotX = -(py - 0.5) * 10
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 will-change-transform ${className}`}
    >
      {children}
    </div>
  )
}
