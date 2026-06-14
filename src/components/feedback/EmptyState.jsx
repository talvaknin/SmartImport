import { Inbox, SearchX } from 'lucide-react'

export default function EmptyState({ filtered, title }) {
  const Icon = filtered ? SearchX : Inbox
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
      <Icon size={36} strokeWidth={1.4} />
      <div className="text-sm">
        {filtered ? 'אין תוצאות לסינון הנוכחי — נסו לנקות סינונים' : title || 'אין עדיין רשומות'}
      </div>
    </div>
  )
}
