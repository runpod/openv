import { Loader2 } from 'lucide-react'
import React from 'react'

import { QueueItem as QueueItemType } from './HomePage'

type QueueItemProps = {
  item: QueueItemType
}

const QueueItem: React.FC<QueueItemProps> = ({ item }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
      <div className="flex items-center space-x-2">
        {item.status === 'processing' && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <span className="truncate">{item.prompt}</span>
      </div>
      <span className="text-sm capitalize">{item.status}</span>
    </div>
  )
}

export default QueueItem

