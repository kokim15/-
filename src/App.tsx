import { useState } from 'react'
import { Search, Loader2, BookOpen, Heart } from 'lucide-react'
import ScriptureCard from './components/ScriptureCard'
import ReligionSelector from './components/ReligionSelector'
import AIReply from './components/AIReply'
import './App.css'

interface ScriptureResult {
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

interface ApiResponse {
  ai_reply: string
  results: ScriptureResult[]
}

export default function App() {
  const [query, setQuery] = useState('')
  const [religion, setReligion] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScriptureResult[]>([])
  const [aiReply, setAiReply] = useState('')
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setAiReply('')
    setSearched(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          religion: religion || 'all',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data: ApiResponse = await response.json()
      setResults(data.results || [])
      setAiReply(data.ai_reply || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search')
      setResults([])
      setAiReply('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sacred Scripture Search
            </h1>
          </div>
          <p className="text-gray-300 text-sm ml-11">AI-Powered Wisdom from Islam, Hinduism, Christianity & Buddhism</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-8 mb-8 backdrop-blur-md">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., compassion, forgiveness, patience, love..."
                className="w-full px-4 py-3 bg-black/40 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition"
              />
              <Search className="absolute right-3 top-3.5 w-5 h-5 text-purple-400 opacity-60" />
            </div>

            {/* Religion Selector */}
            <ReligionSelector value={religion} onChange={setReligion} />

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching Sacred Texts...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Wisdom
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-8 text-red-200">
            <p className="font-semibold">Search Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* AI Reply */}
        {aiReply && <AIReply reply={aiReply} />}

        {/* Results */}
        {searched && !loading && (
          <div>
            {results.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2 mb-6">
                  <Heart className="w-6 h-6" />
                  Sacred Verses ({results.length})
                </h2>
                <div className="grid gap-4">
                  {results.map((result) => (
                    <ScriptureCard key={result.id} scripture={result} />
                  ))}
                </div>
              </div>
            ) : !loading && !error && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No verses found. Try a different search term.</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!searched && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-20 h-20 mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-3">Begin Your Spiritual Journey</h2>
            <p className="max-w-md mx-auto">Search for wisdom across sacred traditions. Explore themes of compassion, wisdom, courage, love, and more.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/30 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          <p>🙏 Honoring the wisdom of all faith traditions 🙏</p>
          <p className="mt-2">Powered by Google Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}
