import { formatCount } from '../lib/vlsm'
import { Box, Gauge, Layers, Users } from './Icons'

function formatPercent(value) {
  if (value > 0 && value < 10) return `${Math.round(value * 10) / 10}%`
  return `${Math.round(value)}%`
}

export default function SummaryCards({ plan, t }) {
  const { summary } = plan
  const failureNote =
    summary.failureCount > 0
      ? `${summary.failureCount} ${t('noSpace')}`
      : `${summary.requirementCount} ${t('requirement')}${summary.requirementCount === 1 ? '' : 's'}`

  const cards = [
    {
      icon: Layers,
      tone: 'cyan',
      label: t('subnets'),
      value: formatCount(summary.subnetCount),
      sub: failureNote,
    },
    {
      icon: Gauge,
      tone: 'violet',
      label: t('totalAllocated'),
      value: formatPercent(summary.spacePct),
      sub: `${formatCount(summary.allocatedAddresses)} ${t('addresses')} · ${formatCount(summary.totalAddresses)}`,
      bar: Math.min(100, summary.spacePct),
    },
    {
      icon: Users,
      tone: 'emerald',
      label: t('usableHosts'),
      value: formatCount(summary.requestedHosts),
      sub: `${formatCount(summary.usableHosts)} IP ${t('usableHosts')}`,
    },
    {
      icon: Box,
      tone: 'amber',
      label: t('freeSpace'),
      value: formatCount(summary.freeAddresses),
      sub:
        summary.freeAddresses === 0
          ? t('noSpace')
          : `${summary.freeBlocks} ${t('free')}`,
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
