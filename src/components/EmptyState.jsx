import { ArrowRight, Plus } from './Icons'

const BARS = [
  { width: '38%', color: '#38bdf8' },
  { width: '24%', color: '#a78bfa' },
  { width: '16%', color: '#34d399' },
  { width: '12%', color: '#fbbf24' },
  { width: '10%', color: '#fb7185' },
]

export default function EmptyState({ presets, onAdd, onLoadPreset, t }) {
  return (
    <section className="panel empty-state">
      <div className="mini-map" aria-hidden="true">
        {BARS.map((bar) => (
          <span key={bar.color} style={{ width: bar.width, background: bar.color }} />
        ))}
      </div>
      <span className="empty-state__kicker">{t('emptyTitle')}</span>
      <h2>{t('emptyDescription')}</h2>
      <p>
        Give each segment a host count. VLSM sorts the requests largest-first, sizes every block to
        the next power of two, and packs them into the base network without overlap.
      </p>

      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            type="button"
            className="preset-card"
            key={preset.id}
            onClick={() => onLoadPreset(preset.id)}
          >
            <span className="preset-card__top">
              <span className="preset-card__name">{preset.label}</span>
              <ArrowRight size={14} />
            </span>
            <span className="preset-card__base mono">{preset.base}</span>
            <span className="preset-card__meta">
              {preset.requirements.length} subnets · {preset.blurb}
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="btn btn--primary" onClick={onAdd}>
        <Plus size={16} />
        {t('addRequirement')}
      </button>
    </section>
  )
}
