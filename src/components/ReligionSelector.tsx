const religions = [
  { value: '', label: 'All Traditions', icon: '🌍' },
  { value: 'islam', label: 'Islam (Quran & Hadith)', icon: '☪️' },
  { value: 'sanatan', label: 'Hinduism (Gita & Vedas)', icon: '🕉️' },
  { value: 'christianity', label: 'Christianity (Bible)', icon: '✝️' },
  { value: 'buddhism', label: 'Buddhism (Tripitaka)', icon: '☸️' },
]

interface ReligionSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function ReligionSelector({ value, onChange }: ReligionSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-3">Filter by Tradition (Optional)</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {religions.map((religion) => (
          <button
            key={religion.value}
            onClick={() => onChange(religion.value)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${
              value === religion.value
                ? 'bg-purple-600 border border-purple-400 text-white'
                : 'bg-black/30 border border-purple-500/30 text-gray-300 hover:border-purple-500/60'
            }`}
          >
            <span>{religion.icon}</span>
            {religion.label}
          </button>
        ))}
      </div>
    </div>
  )
}
