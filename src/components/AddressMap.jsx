import { formatCount } from '../lib/vlsm'

export default function AddressMap({ plan, t }) {
  const { base, subnets, free } = plan
  const segments = [
    ...subnets.map((subnet) => ({
      kind: 'subnet',
      key: `s-${subnet.id}`,
      size: subnet.blockSize,
      startInt: subnet.networkInt,
      color: subnet.color,
      label: subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`,
      cidr: subnet.cidr,
      title: `${subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`}\n${subnet.cidr} · ${subnet.mask}\n${subnet.first} – ${subnet.last} (${formatCount(subnet.usable)} ${t('usableHosts')})`,
    })),
    ...free.map((gap) => ({
      kind: 'free',
      key: `f-${gap.startInt}`,
      size: gap.size,
      startInt: gap.startInt,
      label: t('free'),
      cidr: `${formatCount(gap.size)} addrs`,
      title: `Free space\n${gap.start} – ${gap.end}\n${formatCount(gap.size)} addresses`,
    })),
  ].sort((a, b) => a.startInt - b.startInt)

  return (
    <section className="panel map-panel">
      <div className="panel__head">
        <div className="panel__title-wrap">
          <span className="panel__kicker">Topology</span>
          <h2 className="panel__title">{t('addressSpace')}</h2>
        </div>
        <span className="panel__hint mono">{base.cidr}</span>
      </div>

      <div className="panel__body">
        <div className="map" role="img" aria-label={`Address map of ${base.cidr}`}>
          {segments.map((segment) => (
            <div
              key={segment.key}
              className={`map__seg ${segment.kind === 'free' ? 'map__seg--free' : ''}`}
              style={
                segment.kind === 'subnet'
                  ? { flexGrow: segment.size, background: segment.color }
                  : { flexGrow: segment.size }
              }
              title={segment.title}
            >
              <span>{segment.label}</span>
            </div>
          ))}
        </div>

        <div className="map__ruler">
          <span className="mono">{base.network}</span>
          <span>
            {formatCount(base.size)} addresses · /{base.prefix}
          </span>
          <span className="mono">{base.broadcast}</span>
        </div>

        <div className="legend">
          {subnets.map((subnet) => (
            <span className="legend__item" key={`legend-${subnet.id}`}>
              <i style={{ background: subnet.color }} aria-hidden="true" />
              <span className="legend__name">{subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`}</span>
              <span className="legend__cidr mono">{subnet.cidr}</span>
            </span>
          ))}
          {free.length > 0 && (
            <span className="legend__item legend__item--free">
              <i aria-hidden="true" />
              <span className="legend__name">{t('freeSpace')}</span>
              <span className="legend__cidr mono">{formatCount(plan.summary.freeAddresses)} addrs</span>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
