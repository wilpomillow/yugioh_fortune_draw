"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import anime from "animejs"

import SpeechBubble from "@/components/SpeechBubble"

const DEFAULT_CHARACTER = "/images/cc.png"
const CARD_FRONT_PNG = "/images/ygo_card.jpg"

type FortuneKey = "chee" | "ann" | "swee" | "hu" | "en" | "hikari"

const FORTUNES: Array<{
  key: FortuneKey
  image: string
  character: string
  dialogue: string
  luck: number // 1..6
}> = [
  { key: "chee", image: "/images/chee.png", character: "/images/cc_chee.png", dialogue: "Chee says: today’s luck is looking sharp.", luck: 1 },
  { key: "ann", image: "/images/ann.png", character: "/images/cc_ann.png", dialogue: "Ann says: keep your pace steady — it pays off.", luck: 2 },
  { key: "swee", image: "/images/swee.png", character: "/images/cc_swee.png", dialogue: "Swee says: a small win turns into momentum.", luck: 3 },
  { key: "hu", image: "/images/hu.png", character: "/images/cc_hu.png", dialogue: "Hu says: keep it simple — it works today.", luck: 4 },
  { key: "en", image: "/images/en.png", character: "/images/cc_en.png", dialogue: "En says: trust your first instinct today.", luck: 5 },
  { key: "hikari", image: "/images/hikari.png", character: "/images/cc_hikari.png", dialogue: "Hikari says: you’ll find a bright opening soon.", luck: 6 },
]

const DAILY_KEY = "ygo-fortune:lastDrawDate"
const PICK_KEY = "ygo-fortune:pick"

function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

type Phase = "ready" | "revealing" | "revealed" | "locked"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [pick, setPick] = useState<number>(0)
  const [bubbleText, setBubbleText] = useState("I wonder what today’s fortune will be?")

  // Card refs
  const cardOuterRef = useRef<HTMLDivElement | null>(null)
  const card3dRef = useRef<HTMLDivElement | null>(null)
  const frontFaceRef = useRef<HTMLDivElement | null>(null)

  // Fortune refs
  const fortuneWrapRef = useRef<HTMLDivElement | null>(null)
  const fortuneFloatRef = useRef<HTMLDivElement | null>(null)

  const chosen = useMemo(() => {
    const idx = Math.max(0, Math.min(FORTUNES.length - 1, pick))
    return FORTUNES[idx]
  }, [pick])

  const isLocked = phase === "locked"
  const showCard = phase === "ready" || phase === "revealing"
  const showFortune = phase === "revealed" || phase === "locked"

  const characterSrc = useMemo(() => {
    if (phase === "revealed" || phase === "locked") return chosen.character
    return DEFAULT_CHARACTER
  }, [phase, chosen.character])

  // fortuneText based on result
  const fortuneText = useMemo(() => {
    if (!(phase === "revealed" || phase === "locked")) return ""
    const label = chosen.key.charAt(0).toUpperCase() + chosen.key.slice(1)
    return `${label} — ${chosen.luck}/6 Luck`
  }, [phase, chosen])

  // Explicit ratio: w:h = 1 : 1.4585987
  const CARD_ASPECT = "1 / 1.4585987"
  const CARD_WIDTH = "min(340px, 72vw)"

  // ✅ On load: ONLY lock if already drawn today. Otherwise stay "ready" and do NOT pre-pick.
  useEffect(() => {
    const t = todayKey()
    const last = localStorage.getItem(DAILY_KEY)

    if (last === t) {
      const storedPick = Number(localStorage.getItem(PICK_KEY) ?? "0")
      const p = Number.isFinite(storedPick) ? storedPick : 0
      const idx = Math.max(0, Math.min(FORTUNES.length - 1, p))

      setPick(idx)
      setPhase("locked")
      setBubbleText(FORTUNES[idx].dialogue)
      return
    }

    // Not drawn today -> ready state
    setPhase("ready")
    setBubbleText("I wonder what today’s fortune will be?")
  }, [])

  // Card hover float only when ready
  useEffect(() => {
    const el = cardOuterRef.current
    if (!el) return
    anime.remove(el)

    if (phase === "ready") {
      anime({
        targets: el,
        translateY: [0, -10],
        direction: "alternate",
        loop: true,
        duration: 1600,
        easing: "easeInOutSine",
      })
    } else {
      el.style.transform = "translateY(0px)"
    }

    return () => anime.remove(el)
  }, [phase])

  // Fortune appears after mount
  useEffect(() => {
    const wrap = fortuneWrapRef.current
    if (!wrap) return
    if (phase !== "revealed" && phase !== "locked") return

    anime.remove(wrap)
    anime({
      targets: wrap,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 520,
      easing: "easeOutCubic",
    })
  }, [phase])

  // Fortune float loop (keeps alpha, no background)
  useEffect(() => {
    const el = fortuneFloatRef.current
    if (!el) return

    anime.remove(el)

    if (showFortune) {
      anime({
        targets: el,
        translateY: [0, -10],
        direction: "alternate",
        loop: true,
        duration: 1800,
        easing: "easeInOutSine",
      })
    } else {
      el.style.transform = "translateY(0px)"
    }

    return () => anime.remove(el)
  }, [showFortune])

  // Bubble bounce on text change
  useEffect(() => {
    const bubbleEl = document.getElementById("bubble-bounce")
    if (!bubbleEl) return
    anime.remove(bubbleEl)
    anime({
      targets: bubbleEl,
      scale: [1, 1.03, 1],
      duration: 380,
      easing: "easeOutQuad",
    })
  }, [bubbleText])

  function reveal() {
    if (phase !== "ready") return
    setPhase("revealing")

    // ✅ Random on click, then lock until tomorrow
    const drawPick = Math.floor(Math.random() * FORTUNES.length)
    const drawIdx = Math.max(0, Math.min(FORTUNES.length - 1, drawPick))
    setPick(drawIdx)

    const outer = cardOuterRef.current
    const card3d = card3dRef.current
    const front = frontFaceRef.current

    const tl = anime.timeline({ autoplay: true })

    // Flip the card (two-sided)
    if (card3d) {
      tl.add({
        targets: card3d,
        rotateY: [{ value: 0 }, { value: 180 }],
        duration: 560,
        easing: "easeInOutCubic",
      })
    }

    // Fade only the FRONT image out -> white base beneath shows (card-only fade)
    if (front) {
      tl.add(
        {
          targets: front,
          opacity: [1, 0],
          duration: 360,
          easing: "easeOutQuad",
        },
        "-=420"
      )
    }

    // Fade the card away after the flip
    if (outer) {
      tl.add({
        targets: outer,
        opacity: [1, 0],
        scale: [1, 0.99],
        duration: 260,
        easing: "easeOutQuad",
      })
    }

    tl.finished.then(() => {
      const t = todayKey()
      localStorage.setItem(DAILY_KEY, t)
      localStorage.setItem(PICK_KEY, String(drawIdx))

      setBubbleText(FORTUNES[drawIdx].dialogue)
      setPhase("revealed")
    })
  }

  return (
    <main className="min-h-screen ygo-bg nunito-font text-white overflow-hidden">
      {/* Title centered */}
      <div className="pointer-events-none fixed top-6 left-1/2 z-30 -translate-x-1/2 text-center">
        <div className="text-3xl md:text-5xl font-extrabold tracking-wide drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
          Daily Fortune Draw
        </div>
        <div className="mt-2 text-sm md:text-base text-white/90 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
          {isLocked ? "Come back tomorrow to draw again!" : "Tap the card to reveal today’s fortune."}
        </div>
      </div>

      {/* CENTER CARD / FORTUNE STAGE (behind character) */}
      <div className="fixed inset-0 z-20 flex items-center justify-center">
        <div className="relative">
          {showCard && (
            <div
              ref={cardOuterRef}
              className="cursor-pointer select-none"
              style={{
                perspective: "1400px",
                width: CARD_WIDTH,
                aspectRatio: CARD_ASPECT,
                opacity: 1,
              }}
              onClick={reveal}
              role="button"
              aria-label="Reveal fortune"
            >
              <div
                ref={card3dRef}
                className="relative h-full w-full"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                {/* FRONT FACE */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-[14px] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  {/* white base */}
                  <div className="absolute inset-0 bg-white" />

                  {/* front image fades out to white */}
                  <div ref={frontFaceRef} className="absolute inset-0 opacity-100">
                    <Image src={CARD_FRONT_PNG} alt="Card front" fill className="object-cover" priority />
                  </div>
                </div>

                {/* BACK FACE (white) */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-[14px] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    background: "white",
                  }}
                />
              </div>

              <div className="mt-4 text-center text-sm md:text-base text-white/95 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
                {isLocked ? "Locked" : "Tap to flip"}
              </div>
            </div>
          )}

          {showFortune && (
            <div ref={fortuneWrapRef} className="opacity-0" style={{ width: "min(520px, 86vw)" }}>
              <div className="mx-auto flex flex-col items-center">
                {/* FLOATING PNG (alpha preserved) */}
                <div ref={fortuneFloatRef} className="relative" style={{ width: "min(420px, 78vw)" }}>
                  <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
                    <Image
                      src={chosen.image}
                      alt={`Fortune ${chosen.key}`}
                      fill
                      className="object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
                      priority
                    />
                  </div>
                </div>

                <div className="mt-4 text-center text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
                  <div className="text-lg md:text-xl font-semibold">{fortuneText}</div>
                  <div className="mt-2 text-sm md:text-base text-white/90">Come back tomorrow to draw again!</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHARACTER (front of card) bottom-right */}
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="relative h-[31vh] w-full overflow-hidden">
          <div className="absolute bottom-0 right-6 md:right-10 w-[32vw] max-w-[260px] min-w-[160px]">
            {/* Speech bubble: positioned left, but you can adjust className for placement */}
            <div id="bubble-bounce" className="absolute right-6 top-24 -translate-x-[95%] z-[60]">
              <div className="w-[min(520px,75vw)] max-w-[520px]">
                <SpeechBubble text={bubbleText} />
              </div>
            </div>

            <div className="relative w-full" style={{ aspectRatio: "871 / 917" }}>
              <Image
                src={characterSrc}
                alt="Character"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
