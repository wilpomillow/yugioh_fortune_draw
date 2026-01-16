export default function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative inline-block max-w-[520px] rounded-2xl bg-white px-5 py-4 text-black shadow-xl">
      <div className="text-sm md:text-base leading-snug font-semibold">
        {text}
      </div>

      {/* tail — TOP RIGHT CORNER */}
      <div
        className="
          absolute
          top-2
          right-2
          h-0
          w-0
          border-b-[14px] border-b-white
          border-l-[14px] border-l-transparent
        "
      />
    </div>
  )
}
