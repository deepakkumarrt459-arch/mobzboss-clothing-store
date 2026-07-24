import type { OrderTrackingEvent } from '@/types/order'

interface OrderTimelineProps {
  events?: OrderTrackingEvent[]
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function OrderTimeline({ events }: OrderTimelineProps) {
  const timeline = events?.length ? events : []

  if (timeline.length === 0) {
    return <p className="text-sm text-[#F5F5F5]/70">Tracking information is not available yet.</p>
  }

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div key={`${event.status}-${event.timestamp.toISOString()}-${index}`} className="flex gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-[#C9A227]" />
          <div className="flex-1 rounded-3xl border border-[#7A5C3E]/20 bg-[#0f0f0f] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F5F5F5]">{event.label}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-[#F5F5F5]/60">{event.status.replace(/_/g, ' ')}</p>
              </div>
              <p className="text-xs text-[#F5F5F5]/50">{formatTimestamp(event.timestamp)}</p>
            </div>
            {event.note ? <p className="mt-3 text-sm text-[#F5F5F5]/70">{event.note}</p> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
