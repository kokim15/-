import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ScriptureCardProps {
  scripture: {
    id: string
    religion: string
    topic: string
    verse_text: string
    source_chapter: string
    reference_number: string
    context_explanation: string
    reference_link: string
    arabic_text?: string
    arabic_pronunciation?: string
  }
}

const religionColors: Record<string, { bg: string; border: string; text: string }> = {
  Islam: { bg: 'bg-green-900/20', border: 'border-green-500/30', text: 'text-green-300' },
  Sanatan: { bg: 'bg-orange-900/20', border: 'border-orange-500/30', text: 'text-orange-300' },
  Christianity: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-300' },
  Buddhism: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', text: 'text-yellow-300' },
}

export default function ScriptureCard({ scripture }: ScriptureCardProps) {
  const [copied, setCopied] = useState(false)
  const colors = religionColors[scripture.religion] || religionColors.Islam

  const handleCopy = () => {
    const text = `${scripture.verse_text}\n\n— ${scripture.source_chapter} (${scripture.reference_number})`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-6 backdrop-blur-md hover:shadow-lg transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`${colors.text} font-bold text-sm px-3 py-1 rounded-full bg-black/30`}>
            {scripture.religion}
          </span>
          <span className="text-gray-400 text-xs px-2 py-1 bg-black/20 rounded">{scripture.topic}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition"
          title="Copy verse"
        >
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      {/* Verse Text */}
      <p className="text-white text-lg leading-relaxed mb-4 italic">
        "{scripture.verse_text}"
      </p>

      {/* Arabic Text (if Islamic) */}
      {scripture.arabic_text && (
        <div className="mb-4 p-3 bg-black/20 rounded text-right">
          <p className="text-lg text-white font-semibold">{scripture.arabic_text}</p>
          {scripture.arabic_pronunciation && (
            <p className="text-sm text-gray-300 mt-1">({scripture.arabic_pronunciation})</p>
          )}
        </div>
      )}

      {/* Source Information */}
      <div className="mb-4 text-sm text-gray-300">
        <p className="font-semibold text-white">{scripture.source_chapter}</p>
        <p className="text-gray-400">{scripture.reference_number}</p>
      </div>

      {/* Context Explanation */}
      <p className="text-gray-200 text-sm mb-4 leading-relaxed">
        {scripture.context_explanation}
      </p>

      {/* Reference Link */}
      {scripture.reference_link && (
        <a
          href={scripture.reference_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-semibold transition"
        >
          View Source
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}
