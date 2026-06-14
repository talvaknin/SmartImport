import { Button } from '@heroui/react'
import { CloudOff } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
      <CloudOff size={36} strokeWidth={1.4} className="text-red-400" />
      <div className="text-sm">טעינת הנתונים נכשלה: {message}</div>
      {onRetry && <Button size="sm" color="primary" variant="flat" onPress={onRetry}>נסו שוב</Button>}
    </div>
  )
}
