'use client'

import { QueueItem as QueueItemType } from '@/types'

type QueueItemProps = {
  item: QueueItemType
}

export function QueueItem({ item }: QueueItemProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-xs capitalize px-2 py-1 rounded-full bg-muted">{item.status}</span>
      </div>
      <p className="text-sm line-clamp-3">{item.prompt}</p>
    </div>
  )
} 