import { PRESETS } from '../lib/presets'
import { formatCount } from '../lib/vlsm'
import { ChevronDown, Network, Sparkles } from './Icons'

export default function NetworkForm({
  value,
  parsed,
  onChange,
  allowPointToPoint,
  onTogglePointToPoint,
  onLoadPreset,
  activePreset,
  t,
}) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div className="panel__title-wrap">
          <span className="panel__kicker">01 · {t('sectionFoundation')}</span>
          <h2 className="panel__title">{t('baseNetwork')}</h2>
        </div>
        <span className={`mini-badge ${parsed.ok ? 'is-ok' : ''}`}>
          {parsed.ok ? `/${parsed.prefix}` : '—'}
        </span>
      </div>

      <div className="panel__body">
        <label className="field" htmlFor="base-network">
          <span className="field__label">{t('baseNetworkPlaceholder')}</span>
          <div className={`field__shell ${!parsed.ok && value ? 'is-invalid' : ''}`}>
            <Network size={17} className="field__icon" />
            <input
              id="base-network"
              className="field__input"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="192.168.10.0/24"
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              inputMode="decimal"
              aria-invalid={!parsed.ok}
            />
          </div>
        </label>

        {parsed.ok ? (
          <div className="parsed">
            <div className="parsed__line">
              <span className="parsed__net mono">{parsed.network}</span>
              <span className="parsed__prefix mono">/{parsed.prefix}</span>
            </div>
            <span className="parsed__meta">
           {formatCount(parsed.size)} {t('addresses')} · {formatCount(parsed.usable)} {t('usableHosts')}
            </span>
            <span className="parsed__meta parsed__meta--mono">{t('mask')} {parsed.mask}</span>
            {parsed.normalized && (
              <span className="parsed__note">
                Host bits cleared → {parsed.cidr}
              </span>
            )}
            {!parsed.hadPrefix && (
              <span className="parsed__note parsed__note--muted">
                No prefix supplied — /{parsed.prefix} assumed.
              </span>
            )}
          </div>
        ) : value ? (
          <p className="field__error">{parsed.error}</p>
        ) : (
          <div className="parsed parsed--empty">
            <span className="parsed__meta">
              No prefix? /24 is assumed. The block is normalized to its network address.
            </span>
          </div>
        )}

        <label className="field field--spaced" htmlFor="preset-select">
          <span className="field__label">Start from an example</span>
          <div className="select-shell">
            <Sparkles size={16} className="field__icon" />
            <select
              id="preset-select"
              value={activePreset ?? ''}
              onChange={(event) => {
                if (event.target.value) onLoadPreset(event.target.value)
              }}
            >
              <option value="">Choose a scenario…</option>
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} · {preset.base}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-chevron" />
          </div>
        </label>

        <div className="switch-row">
          <div className="switch-row__copy">
            <span className="switch-row__title">{t('allowP2P')}</span>
          <span className="switch-row__hint">
         {t('allowP2PDescription')}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={allowPointToPoint}
            aria-label="Point-to-point mode"
            className={`switch ${allowPointToPoint ? 'is-on' : ''}`}
            onClick={() => onTogglePointToPoint(!allowPointToPoint)}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
    </section>
  )
}
