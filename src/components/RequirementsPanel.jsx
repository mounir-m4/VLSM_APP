import { useEffect } from 'react'
import { colorForIndex } from '../lib/palette'
import { hostsToPrefix, MAX_HOSTS } from '../lib/vlsm'
import { Plus, Trash } from './Icons'

function parseHosts(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  const n = Number(text)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_HOSTS) return null
  return n
}

export default function RequirementsPanel({
  requirements,
  allowPointToPoint,
  onChange,
  onRemove,
  onAdd,
  onClear,
  focusId,
  t,
}) {
  useEffect(() => {
    if (!focusId) return
    const frame = requestAnimationFrame(() => {
      const input = document.getElementById(`req-name-${focusId}`)
      input?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [focusId])

  const totalHosts = requirements.reduce((sum, row) => sum + (parseHosts(row.hosts) ?? 0), 0)

  return (
    <section className="panel">
      <div className="panel__head">
        <div className="panel__title-wrap">
          <span className="panel__kicker">02 · {t('sectionRequirements')}</span>
          <h2 className="panel__title">
            {t('subnets')}
            <span className="count-badge">{requirements.length}</span>
          </h2>
        </div>
        {requirements.length > 0 && (
          <button type="button" className="text-btn text-btn--danger" onClick={onClear}>
            {t('clearAll')}
          </button>
        )}
      </div>

      <div className="panel__body">
        {requirements.length === 0 ? (
          <div className="req-empty">
            <span>{t('noRequirements')}</span>
            <span>{t('noRequirementsHint')}</span>
          </div>
        ) : (
          <div className="req-list">
            {requirements.map((row, index) => {
              const hosts = parseHosts(row.hosts)
              const prefix = hosts === null ? null : hostsToPrefix(hosts, allowPointToPoint)
              const blockSize = prefix === null ? null : 2 ** (32 - prefix)
              const invalid = row.hosts !== '' && hosts === null

              return (
                <div className={`req-row ${invalid ? 'is-invalid' : ''}`} key={row.id}>
                  <span
                    className="req-row__bar"
                    style={{ background: colorForIndex(index) }}
                    aria-hidden="true"
                  />
                  <input
                    id={`req-name-${row.id}`}
                    className="req-row__name"
                    value={row.name}
                    onChange={(event) => onChange(row.id, { name: event.target.value })}
                    placeholder={`${t('subnetStep')} ${index + 1}`}
                    aria-label={`${t('nameForSubnet')} ${index + 1}`}
                    maxLength={32}
                  />
                  <div className="req-row__hosts">
                    <input
                      type="number"
                      min="1"
                      max={MAX_HOSTS}
                      inputMode="numeric"
                      value={row.hosts}
                      onChange={(event) => onChange(row.id, { hosts: event.target.value })}
                      placeholder="0"
                      aria-label={`${t('requiredHostsFor')} ${index + 1}`}
                    />
                    <span>{t('hosts')}</span>
                  </div>
                  <span
                    className={`req-row__prefix mono ${prefix !== null ? 'is-ready' : ''}`}
                    title={
                      blockSize
                        ? `/${prefix} · ${blockSize.toLocaleString('en-US')} ${t('addressesBlock')}`
                        : t('enterHostCount')
                    }
                  >
                    {prefix !== null ? `/${prefix}` : '—'}
                  </span>
                  <button
                    type="button"
                    className="row-btn"
                    onClick={() => onRemove(row.id)}
                    aria-label={`${t('removeSubnet')} ${row.name || `${t('subnetStep')} ${index + 1}`}`}
                    title={t('removeSubnet')}
                  >
                    <Trash size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button type="button" className="add-row-btn" onClick={onAdd}>
          <Plus size={16} />
          {t('addRequirement')}
        </button>

        {requirements.length > 0 && (
          <div className="req-total">
            <span>
              {requirements.length} {requirements.length === 1 ? t('requirementSingle') : t('requirementsCount')}
            </span>
            <span>
              <strong>{totalHosts.toLocaleString('en-US')}</strong> {t('hostsRequested')}
            </span>
          </div>
        )}

        <div className="req-note">
          <span className="req-note__dot" />
          {t('blocksSortedNote')}
        </div>
      </div>
    </section>
  )
}
