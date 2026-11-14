import { formatCount, prefixKind } from '../lib/vlsm'
import { Copy, X } from './Icons'

function DetailRow({ label, value, mono = true, onCopy, t, muted = false }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className={`detail-row__value ${mono ? 'mono' : ''} ${muted ? 'muted' : ''}`}>{value}</span>
      <button
        type="button"
        className="row-btn detail-row__copy"
        onClick={() => onCopy(String(value))}
        aria-label={`${t('copyValue')} — ${label}`}
        title={t('copyValue')}
      >
        <Copy size={13} />
      </button>
    </div>
  )
}

/**
 * Subnet detail view — every calculated value for one allocated subnet,
 * with per-value copy buttons.
 */
export default function SubnetDetail({ subnet, onClose, onCopyValue, t }) {
  if (!subnet) return null

  const name = subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`
  const kind = prefixKind(subnet.prefix)

  const kindLabel =
    kind === 'lan' ? t('detailsKindLan') : kind === 'p2p' ? t('detailsKindP2p') : t('detailsKindHost')

  const broadcastLabel =
    subnet.hasBroadcast
      ? subnet.broadcast
      : subnet.prefix === 31
        ? t('detailsNoBroadcast')
        : t('detailsNoBroadcastHost')

  return (
    <section className="panel detail-panel" role="dialog" aria-label={t('detailsTitle')}>
      <div className="panel__head">
        <div className="panel__title-wrap">
          <span className="panel__kicker">
            <i className="dot dot--sm" style={{ background: subnet.color }} aria-hidden="true" />{' '}
            {t('detailsTitle')}
          </span>
          <h2 className="panel__title">
            {name} <span className="mono detail-title-cidr">{subnet.cidr}</span>
          </h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('detailsClose')}>
          <X size={16} />
        </button>
      </div>

      <div className="panel__body">
        <p className="detail-kind">{kindLabel}</p>

        <div className="detail-grid">
          <DetailRow label={t('cidr')} value={subnet.cidr} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('netmask')} value={subnet.mask} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsMaskBinary')} value={subnet.maskBinary} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('netmask').replace(/.*/, 'Wildcard')} value={subnet.wildcard} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsNetwork')} value={subnet.network} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsFirstIp')} value={subnet.first} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsLastIp')} value={subnet.last} onCopy={onCopyValue} t={t} />
          <DetailRow
            label={t('gateway')}
            value={subnet.gateway ?? '—'}
            onCopy={onCopyValue}
            t={t}
            muted={!subnet.gateway}
          />
          <DetailRow label={t('detailsBroadcast')} value={broadcastLabel} onCopy={onCopyValue} t={t} muted={!subnet.hasBroadcast} />
          <DetailRow label={t('detailsTotalAddresses')} value={formatCount(subnet.blockSize)} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsUsableCapacity')} value={formatCount(subnet.usable)} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsRequested')} value={formatCount(subnet.hosts)} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsRemaining')} value={formatCount(subnet.remainingUsable)} onCopy={onCopyValue} t={t} />
          <DetailRow label={t('detailsEfficiency')} value={`${subnet.efficiency.toFixed(1)}%`} onCopy={onCopyValue} t={t} />
        </div>
      </div>
    </section>
  )
}
