import { formatCount } from '../lib/vlsm'
import { AlertTriangle, Copy, Download } from './Icons'

function efficiencyTone(value) {
  if (value >= 75) return 'high'
  if (value >= 40) return 'mid'
  return 'low'
}

export default function ResultsTable({ plan, sortMode, onSortMode, onCopySubnet, onCopyPlan, onExport, t }) {
  const rows =
    sortMode === 'size'
      ? [...plan.subnets].sort((a, b) => a.step - b.step)
      : plan.subnets

  return (
    <section className="panel table-panel">
      <div className="panel__head panel__head--wrap">
        <div className="panel__title-wrap">
          <span className="panel__kicker">{t('sectionAllocation')}</span>
          <h2 className="panel__title">
            {t('subnet')}
            <span className="count-badge">{plan.summary.subnetCount}</span>
          </h2>
        </div>
        <div className="panel__actions">
          <div className="seg-control" role="group" aria-label="Sort subnets">
            <button
              type="button"
              className={sortMode === 'address' ? 'is-active' : ''}
              onClick={() => onSortMode('address')}
            >
              {t('cidr')}
            </button>
            <button
              type="button"
              className={sortMode === 'size' ? 'is-active' : ''}
              onClick={() => onSortMode('size')}
            >
              {t('blockSize')}
            </button>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCopyPlan}>
            <Copy size={14} />
            {t('copyRow')}
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={onExport}>
            <Download size={14} />
            {t('exportCsv')}
          </button>
        </div>
      </div>

      {plan.subnets.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('subnet')}</th>
                <th>{t('hosts')}</th>
                <th>{t('usableRange')}</th>
                <th>{t('gateway')}</th>
                <th>{t('broadcast')}</th>
                <th>{t('efficiency')}</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((subnet) => {
                const tone = efficiencyTone(subnet.efficiency)
                return (
                  <tr key={subnet.id}>
                    <td>
                      <div className="cell-subnet">
                        <span
                          className="dot"
                          style={{ background: subnet.color }}
                          aria-hidden="true"
                        />
                        <div className="cell-subnet__body">
                          <div className="cell-subnet__name">
                            {subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`}
                          </div>
                          <div className="cell-subnet__cidr">
                            <span className="mono">{subnet.cidr}</span>
                            <span className="muted"> · {subnet.mask}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <strong>{formatCount(subnet.hosts)}</strong>
                        <span>{formatCount(subnet.usable)} usable</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <strong className="mono">{subnet.first}</strong>
                        <span className="mono cell-range-end">→ {subnet.last}</span>
                      </div>
                    </td>
                    <td className="mono cell-mono">{subnet.gateway}</td>
                    <td className="mono cell-mono">{subnet.broadcast}</td>
                    <td>
                      <div className={`eff eff--${tone}`}>
                        <div className="eff__bar" aria-hidden="true">
                          <span
                            className="eff__fill"
                            style={{ width: `${Math.max(3, subnet.efficiency)}%` }}
                          />
                        </div>
                        <span className="eff__label">{Math.round(subnet.efficiency)}%</span>
                      </div>
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="row-btn"
                        onClick={() => onCopySubnet(subnet)}
                        title={t('copySubnetDetails')}
                        aria-label={`${t('copySubnetDetails')} — ${subnet.name || `${t('subnetStep')} ${subnet.step}`}`}
                      >
                        <Copy size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-table">
          <AlertTriangle size={18} />
          <span>{t('noSubnetFound')}</span>
        </div>
      )}

      {plan.failures.length > 0 && (
        <div className="failures">
          <h3>
            <AlertTriangle size={15} />
            {t('couldNotPlaceReq')} {plan.failures.length} {plan.failures.length === 1 ? t('requirementSingle') : t('requirementsCount')}
          </h3>
          <ul>
            {plan.failures.map((failure) => (
              <li key={failure.id}>
                <span
                  className="dot dot--sm"
                  style={{ background: failure.color }}
                  aria-hidden="true"
                />
                <strong>{failure.name?.trim() || t('unnamedSubnet')}</strong>
                <span>
                  {formatCount(failure.hosts)} hosts · needs /{failure.prefix}
                </span>
                <span className="failure__reason">{failure.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
