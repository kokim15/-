import { MessageCircle } from 'lucide-react'

interface AIReplyProps {
  reply: string
}

export default function AIReply({ reply }: AIReplyProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6 mb-8 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <MessageCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-300 mb-2">AI Spiritual Insight</h3>
          <p className="text-gray-200 leading-relaxed">{reply}</p>
        </div>
      </div>
    </div>
  )
}
