import { useEffect, useMemo, useState } from 'react'
import AddressMap from './components/AddressMap'
import EmptyState from './components/EmptyState'
import { AlertTriangle, Info, Moon, Network, Sun } from './components/Icons'
import NetworkForm from './components/NetworkForm'
import RequirementsPanel from './components/RequirementsPanel'
import ResultsTable from './components/ResultsTable'
import SummaryCards from './components/SummaryCards'
import Toast from './components/Toast'
import { colorForIndex } from './lib/palette'
import { PRESETS } from './lib/presets'
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

export default function App() {
  const [initial] = useState(seedState)
  const [baseInput, setBaseInput] = useState(initial.base)
  const [requirements, setRequirements] = useState(initial.requirements)
  const [allowP2P, setAllowP2P] = useState(initial.allowP2P)
  const [theme, setTheme] = useState(seedTheme)
  const [sortMode, setSortMode] = useState('address')
  const [toast, setToast] = useState(null)
  const [focusId, setFocusId] = useState(null)
  const [activePreset, setActivePreset] = useState(null)

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
    showToast('Subnet list cleared')
  }

  const loadPreset = (id) => {
    const preset = PRESETS.find((item) => item.id === id)
    if (!preset) return
    setBaseInput(preset.base)
    setAllowP2P(Boolean(preset.allowPointToPoint))
    setRequirements(preset.requirements.map((row) => ({ ...row, id: uid() })))
    setActivePreset(preset.id)
    showToast(`Loaded “${preset.label}”`)
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
    showToast('CSV exported')
  }

  const hasValidRequirements = validRows.length > 0

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
                VLSM <span>Studio</span>
              </h1>
              <p className="brand__sub">Variable Length Subnet Mask planner for IPv4</p>
            </div>
          </div>

          <div className="topbar__actions">
            <span className="pill">
              <span className="pill__dot" />
              Live planner
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title="Toggle theme"
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
            />

            <RequirementsPanel
              requirements={requirements}
              allowPointToPoint={allowP2P}
              onChange={updateRequirement}
              onRemove={removeRequirement}
              onAdd={addRequirement}
              onClear={clearRequirements}
              focusId={focusId}
            />
          </aside>

          <main className="content">
            {!base.ok ? (
              <section className="panel state-panel">
                <div className="state-panel__icon">
                  <AlertTriangle size={26} />
                </div>
                <h2>Base network needs attention</h2>
                <p>{base.error}</p>
                <p className="state-panel__hint">
                  Try{' '}
                  <button
                    type="button"
                    className="inline-code"
                    onClick={() => handleBaseChange('192.168.10.0/24')}
                  >
                    192.168.10.0/24
                  </button>{' '}
                  or load a scenario from the sidebar.
                </p>
              </section>
            ) : (
              <>
                {invalidRows.length > 0 && (
                  <div className="alert alert--warning" role="status">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Some host counts aren’t usable.</strong>
                      <p>
                        Enter a whole number from 1 to {formatCount(MAX_HOSTS)}. Invalid rows are
                        skipped in the plan.
                      </p>
                    </div>
                  </div>
                )}

                {plan && plan.failures.length > 0 && (
                  <div className="alert alert--danger" role="status">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>
                        {plan.failures.length} subnet
                        {plan.failures.length === 1 ? '' : 's'} couldn’t be placed.
                      </strong>
                      <p>
                        {base.cidr} ran out of contiguous space. Enlarge the base block or lower
                        the host counts — the details are listed under the allocation table.
                      </p>
                    </div>
                  </div>
                )}

                {!hasValidRequirements ? (
                  <EmptyState
                    presets={PRESETS}
                    onAdd={addRequirement}
                    onLoadPreset={loadPreset}
                  />
                ) : (
                  plan && (
                    <>
                      <SummaryCards plan={plan} />
                      <AddressMap plan={plan} />
                      <ResultsTable
                        plan={plan}
                        sortMode={sortMode}
                        onSortMode={setSortMode}
                        onCopySubnet={(subnet) =>
                          copyText(
                            subnetToText(subnet),
                            `${subnet.name?.trim() || `Subnet ${subnet.step}`} copied`,
                          )
                        }
                        onCopyPlan={() => copyText(planToText(plan), 'Full plan copied')}
                        onExport={exportCsv}
                      />
                    </>
                  )
                )}
              </>
            )}

            <footer className="footer">
              <Info size={15} />
              <p>
                Every request is rounded up to the nearest power-of-two block, sorted largest
                first, and aligned to its own boundary. Smaller blocks then fill the gaps.
                Point-to-point mode enables /31 links and /32 loopbacks (RFC 3021).
              </p>
            </footer>
          </main>
        </div>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} />}
    </div>
  )
}
