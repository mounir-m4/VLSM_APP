import { formatCount } from '../lib/vlsm'
import { Box, Gauge, Layers, Users } from './Icons'

function formatPercent(value) {
  if (value > 0 && value < 10) return `${Math.round(value * 10) / 10}%`
  return `${Math.round(value)}%`
}

export default function SummaryCards({ plan }) {
  const { summary } = plan
  const failureNote =
    summary.failureCount > 0
      ? `${summary.failureCount} couldn’t fit`
      : `${summary.requirementCount} requirement${summary.requirementCount === 1 ? '' : 's'}`

  const cards = [
    {
      icon: Layers,
      tone: 'cyan',
      label: 'Subnets planned',
      value: formatCount(summary.subnetCount),
      sub: failureNote,
    },
    {
      icon: Gauge,
      tone: 'violet',
      label: 'Space allocated',
      value: formatPercent(summary.spacePct),
      sub: `${formatCount(summary.allocatedAddresses)} of ${formatCount(summary.totalAddresses)} addresses`,
      bar: Math.min(100, summary.spacePct),
    },
    {
      icon: Users,
      tone: 'emerald',
      label: 'Hosts served',
      value: formatCount(summary.requestedHosts),
      sub: `${formatCount(summary.usableHosts)} usable IPs available`,
    },
    {
      icon: Box,
      tone: 'amber',
      label: 'Free space',
      value: formatCount(summary.freeAddresses),
      sub:
        summary.freeAddresses === 0
          ? 'Every address accounted for'
          : `${summary.freeBlocks} contiguous gap${summary.freeBlocks === 1 ? '' : 's'}`,
    },
  ]

  return (
    <div className="summary-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article className="stat" key={card.label}>
            <div className="stat__top">
              <span className="stat__label">{card.label}</span>
              <span className={`stat__icon stat__icon--${card.tone}`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="stat__value">{card.value}</div>
            <div className="stat__sub">{card.sub}</div>
            {typeof card.bar === 'number' && (
              <div className="stat__bar" aria-hidden="true">
                <span style={{ width: `${card.bar}%` }} />
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
