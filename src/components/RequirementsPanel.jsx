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
          <span className="panel__kicker">02 · Demand</span>
          <h2 className="panel__title">
            Subnets
            <span className="count-badge">{requirements.length}</span>
          </h2>
        </div>
        {requirements.length > 0 && (
          <button type="button" className="text-btn text-btn--danger" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="panel__body">
        {requirements.length === 0 ? (
          <div className="req-empty">
            <span>No subnet requirements yet.</span>
            <span>Add one below to start allocating.</span>
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
                    placeholder={`Subnet ${index + 1}`}
                    aria-label={`Name for subnet ${index + 1}`}
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
                      aria-label={`Required hosts for subnet ${index + 1}`}
                    />
                    <span>hosts</span>
                  </div>
                  <span
                    className={`req-row__prefix mono ${prefix !== null ? 'is-ready' : ''}`}
                    title={
                      blockSize
                        ? `/${prefix} block · ${blockSize.toLocaleString('en-US')} addresses`
                        : 'Enter a host count'
                    }
                  >
                    {prefix !== null ? `/${prefix}` : '—'}
                  </span>
                  <button
                    type="button"
                    className="row-btn"
                    onClick={() => onRemove(row.id)}
                    aria-label={`Remove ${row.name || `subnet ${index + 1}`}`}
                    title="Remove subnet"
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
          Add a subnet
        </button>

        {requirements.length > 0 && (
          <div className="req-total">
            <span>{requirements.length} requirement{requirements.length === 1 ? '' : 's'}</span>
            <span>
              <strong>{totalHosts.toLocaleString('en-US')}</strong> hosts requested
            </span>
          </div>
        )}

        <div className="req-note">
          <span className="req-note__dot" />
          Blocks are sized automatically and sorted largest-first.
        </div>
      </div>
    </section>
  )
}
