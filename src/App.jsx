import { useEffect, useMemo, useState } from 'react'
import AddressMap from './components/AddressMap'
import EmptyState from './components/EmptyState'
import FlsmPanel from './components/FlsmPanel'
import SubnetDetail from './components/SubnetDetail'
import { AlertTriangle, Info, Moon, Network, Sun } from './components/Icons'
import LanguageToggle from './components/LanguageToggle'
import NetworkForm from './components/NetworkForm'
import RequirementsPanel from './components/RequirementsPanel'
import ResultsTable from './components/ResultsTable'
import SummaryCards from './components/SummaryCards'
import Toast from './components/Toast'
import { colorForIndex } from './lib/palette'
import { PRESETS } from './lib/presets'
import { getTranslation } from './lib/translations'
import { exportPlanPdf } from './lib/report'
import {
  MAX_HOSTS,
  calculatePlan,
  formatCount,
  parseCidr,
  planToCsv,
  planToText,
  subnetToText,
} from './lib/vlsm'

const STORAGE_KEY = 'vlsm-studio:plan'
const THEME_KEY = 'vlsm-studio:theme'
const LANG_KEY = 'vlsm-studio:language'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function parseHosts(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  const n = Number(text)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_HOSTS) return null
  return n
}

function seedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved && typeof saved.base === 'string' && Array.isArray(saved.requirements)) {
        return {
          base: saved.base,
          allowP2P: Boolean(saved.allowP2P),
          requirements: saved.requirements.map((row) => ({
            id: typeof row.id === 'string' && row.id ? row.id : uid(),
            name: typeof row.name === 'string' ? row.name : '',
            hosts:
              typeof row.hosts === 'string' || typeof row.hosts === 'number'
                ? String(row.hosts)
                : '',
          })),
        }
      }
    }
  } catch {
    /* localStorage is optional — fall through to the demo scenario. */
  }

  const preset = PRESETS[0]
  return {
    base: preset.base,
    allowP2P: Boolean(preset.allowPointToPoint),
    requirements: preset.requirements.map((row) => ({ ...row, id: uid() })),
  }
}

function seedTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

function seedLanguage() {
  try {
    const stored = window.localStorage.getItem(LANG_KEY)
    if (stored) return stored
    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('fr')) return 'fr'
    return 'en'
  } catch {
    return 'en'
  }
}

export default function App() {
  const [initial] = useState(seedState)
  const [baseInput, setBaseInput] = useState(initial.base)
  const [requirements, setRequirements] = useState(initial.requirements)
  const [allowP2P, setAllowP2P] = useState(initial.allowP2P)
  const [theme, setTheme] = useState(seedTheme)
  const [language, setLanguage] = useState(seedLanguage)
  const [sortMode, setSortMode] = useState('address')
  const [mode, setMode] = useState('vlsm')
  const [detailId, setDetailId] = useState(null)
  const [toast, setToast] = useState(null)
  const [focusId, setFocusId] = useState(null)
  const [activePreset, setActivePreset] = useState(null)

  const t = (key) => getTranslation(language, key)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#060c16' : '#edf2f9')
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_KEY, language)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = language
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        language === 'fr'
          ? 'Calculateur VLSM gratuit pour réseaux IPv4. Découpez un bloc CIDR en sous-réseaux de taille optimale — carte d\'adressage en direct, tableau d\'allocation, export CSV. Mode point-à-point /31 /32.'
          : 'Free online VLSM calculator for IPv4 networks. Split a base CIDR block into right-sized subnets instantly — live address map, allocation table with gateways and broadcast addresses, point-to-point /31 /32 support, CSV export.',
      )
    }
  }, [language])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            base: baseInput,
            allowP2P,
            requirements: requirements.map(({ id, name, hosts }) => ({ id, name, hosts })),
          }),
        )
      } catch {
        /* ignore quota / privacy errors */
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [baseInput, allowP2P, requirements])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const base = useMemo(() => parseCidr(baseInput), [baseInput])

  const rows = useMemo(
    () =>
      requirements.map((row, index) => ({
        ...row,
        hostsNum: parseHosts(row.hosts),
        color: colorForIndex(index),
      })),
    [requirements],
  )

  const validRows = useMemo(() => rows.filter((row) => row.hostsNum !== null), [rows])
  const invalidRows = useMemo(
    () => rows.filter((row) => row.hosts !== '' && row.hostsNum === null),
    [rows],
  )

  const plan = useMemo(() => {
    if (!base.ok) return null
    return calculatePlan(
      base,
      validRows.map((row) => ({ ...row, hosts: row.hostsNum })),
      { allowPointToPoint: allowP2P },
    )
  }, [base, validRows, allowP2P])

  const showToast = (message) => setToast({ message, key: Date.now() })

  const handleBaseChange = (value) => {
    setBaseInput(value)
    setActivePreset(null)
  }

  const updateRequirement = (id, patch) => {
    setRequirements((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
    setActivePreset(null)
  }

  const addRequirement = () => {
    const id = uid()
    setRequirements((current) => [...current, { id, name: '', hosts: '' }])
    setFocusId(id)
    setActivePreset(null)
  }

  const removeRequirement = (id) => {
    setRequirements((current) => current.filter((row) => row.id !== id))
    setActivePreset(null)
  }

  const clearRequirements = () => {
    setRequirements([])
    setActivePreset(null)
    showToast(t('clearAll'))
  }

  const loadPreset = (id) => {
    const preset = PRESETS.find((item) => item.id === id)
    if (!preset) return
    setBaseInput(preset.base)
    setAllowP2P(Boolean(preset.allowPointToPoint))
    setRequirements(preset.requirements.map((row) => ({ ...row, id: uid() })))
    setActivePreset(preset.id)
    showToast(`${t('loadPreset')} « ${preset.label} »`)
  }

  const copyText = async (text, message) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(text)
      showToast(message)
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
        showToast(message)
      } catch {
        showToast('Your browser blocked clipboard access')
      }
    }
  }

  const exportCsv = () => {
    if (!plan) return
    const csv = planToCsv(plan)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `vlsm-${plan.base.network.replaceAll('.', '-')}-${plan.base.prefix}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    showToast(t('exportCsv'))
  }

  const exportPdf = () => {
    if (!plan) return
    exportPlanPdf(plan, language)
    showToast(t('exportPdf'))
  }

  const exportCsvNamed = (csv, kind) => {
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${kind}-${base.network.replaceAll('.', '-')}-${base.prefix}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    showToast(t('exportCsv'))
  }

  const hasValidRequirements = validRows.length > 0

  const detailSubnet = plan?.subnets.find((subnet) => subnet.id === detailId) ?? null

  return (
    <div className="app">
      <div className="glow glow--a" aria-hidden="true" />
      <div className="glow glow--b" aria-hidden="true" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand__mark">
              <Network size={23} />
            </span>
            <div>
              <h1 className="brand__title">
                {t('appTitle')}
          </h1>
              <p className="brand__sub">{t('appSubtitle')}</p>
            </div>
          </div>

          <div className="topbar__actions">
            <span className="pill">
              <span className="pill__dot" />
              {t('emptyTitle')}
            </span>
            <div className="mode-switch" role="tablist" aria-label={t('modeSwitchLabel')}>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'vlsm'}
                className={`mode-switch__btn ${mode === 'vlsm' ? 'is-active' : ''}`}
                onClick={() => setMode('vlsm')}
              >
                {t('modeVlsm')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'flsm'}
                className={`mode-switch__btn ${mode === 'flsm' ? 'is-active' : ''}`}
                onClick={() => setMode('flsm')}
              >
                {t('modeFlsm')}
              </button>
            </div>
            <LanguageToggle currentLang={language} onLanguageChange={setLanguage} />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={t(theme === 'dark' ? 'themeLight' : 'themeDark')}
              title={t(theme === 'dark' ? 'themeLight' : 'themeDark')}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <NetworkForm
              value={baseInput}
              parsed={base}
              onChange={handleBaseChange}
              allowPointToPoint={allowP2P}
              onTogglePointToPoint={(next) => {
                setAllowP2P(next)
                setActivePreset(null)
              }}
              onLoadPreset={loadPreset}
              activePreset={activePreset}
              t={t}
            />

            <RequirementsPanel
              requirements={requirements}
           allowPointToPoint={allowP2P}
              onChange={updateRequirement}
              onRemove={removeRequirement}
              onAdd={addRequirement}
         onClear={clearRequirements}
              focusId={focusId}
              t={t}
            />
          </aside>

          <main className="content">
            {mode === 'flsm' ? (
              <FlsmPanel
                baseInput={baseInput}
                t={t}
                onCopyText={(text) => copyText(text, `${t('copiedToClipboard')} (FLSM)`)}
                onExportCsv={exportCsvNamed}
              />
            ) : (
            <>
            {!base.ok ? (
              <section className="panel state-panel">
                <div className="state-panel__icon">
                  <AlertTriangle size={26} />
                </div>
                <h2>{t('baseNeedsAttention')}</h2>
                <p>{base.error}</p>
                <p className="state-panel__hint">
                  {t('tryPrefix')}{' '}
                  <button
                    type="button"
                    className="inline-code"
                    onClick={() => handleBaseChange('192.168.10.0/24')}
                  >
                    192.168.10.0/24
                  </button>{' '}
                  {t('orLoadScenario')}
                </p>
              </section>
            ) : (
              <>
                {invalidRows.length > 0 && (
                  <div className="alert alert--warning" role="status">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>{t('invalidHostCounts')}</strong>
                      <p>
                        {t('invalidHostCountsDetail')} {formatCount(MAX_HOSTS)}. {t('invalidRowsSkipped')}
                      </p>
                    </div>
                  </div>
                )}

                {plan && plan.failures.length > 0 && (
                  <div className="alert alert--danger" role="status">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>
                        {plan.failures.length} {t('subnets')} {t('couldNotPlace')}
                      </strong>
                      <p>
                        {base.cidr} {t('ranOutOfSpace')}
                      </p>
                    </div>
                  </div>
                )}

                {!hasValidRequirements ? (
                  <EmptyState
                    presets={PRESETS}
                    onAdd={addRequirement}
                    onLoadPreset={loadPreset}
                    t={t}
                  />
                ) : (
                  plan && (
                    <>
                      <SummaryCards plan={plan} t={t} />
                      <AddressMap plan={plan} t={t} />
                      <ResultsTable
                        plan={plan}
                        sortMode={sortMode}
                        onSortMode={setSortMode}
                        onViewDetails={setDetailId}
                        onCopySubnet={(subnet) =>
                          copyText(
                            subnetToText(subnet),
                            `${subnet.name?.trim() || `${t('subnetStep')} ${subnet.step}`} ${t('copiedToClipboard')}`,
                          )
                        }
                        onCopyPlan={() => copyText(planToText(plan), `${t('copiedToClipboard')} (plan)`)}
                        onExport={exportCsv}
                        onExportPdf={exportPdf}
                        t={t}
                      />
                    </>
                  )
                )}
              </>
            )}
            </>
            )}

            {mode === 'vlsm' && (
              <SubnetDetail
                subnet={detailSubnet}
                onClose={() => setDetailId(null)}
                onCopyValue={(value) => copyText(value, t('copiedToClipboard'))}
                t={t}
              />
            )}

            <footer className="footer">
              <div className="footer__note">
                <Info size={15} />
                <p>{t('footerNote')}</p>
              </div>
            </footer>
            <footer className="footer footer--repo">
              <a
                className="footer__repo"
                href="https://github.com/mounir-m4/VLSM_APP"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer__repo-name">GitHub</span>
                <span className="footer__repo-desc">{t('footerRepoDesc')}</span>
              </a>
            </footer>
          </main>
        </div>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} />}
    </div>
  )
}
