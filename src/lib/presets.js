/**
 * Ready-to-explore scenarios. Host counts are strings so they map directly
 * into the text inputs.
 */
export const PRESETS = [
  {
    id: 'office',
    label: 'Small business',
    labelFr: 'Petite entreprise',
    blurb: 'Four departments in a /24',
    blurbFr: 'Quatre départements dans un /24',
    base: '192.168.10.0/24',
    allowPointToPoint: false,
    explanation:
      'A small office network: administration, technical staff, employees and management share one /24. VLSM sizes each VLAN so little address space is wasted.',
    explanationFr:
      'Réseau de bureau : administration, équipe technique, employés et direction partagent un /24. Le VLSM dimensionne chaque VLAN pour gaspiller peu d’espace.',
    requirements: [
      { name: 'Administration', hosts: '50' },
      { name: 'Technical dept.', hosts: '25' },
      { name: 'Employees', hosts: '12' },
      { name: 'Management', hosts: '5' },
    ],
  },
  {
    id: 'organization',
    label: 'Multi-department org',
    labelFr: 'Organisation multi-départements',
    blurb: 'Headquarters, finance, engineering…',
    blurbFr: 'Siège, finances, ingénierie…',
    base: '10.20.0.0/22',
    allowPointToPoint: false,
    explanation:
      'A larger organization: the headquarters LAN dominates, so largest-first allocation keeps every department aligned without overlap.',
    explanationFr:
      'Organisation plus grande : le LAN du siège domine, l’allocation du plus grand au plus petit garde chaque département aligné sans chevauchement.',
    requirements: [
      { name: 'Headquarters', hosts: '200' },
      { name: 'Finance', hosts: '100' },
      { name: 'Engineering', hosts: '60' },
      { name: 'Sales', hosts: '30' },
      { name: 'Management', hosts: '10' },
    ],
  },
  {
    id: 'campus',
    label: 'Campus core',
    labelFr: 'Noyau du campus',
    blurb: 'A /16 split across departments',
    blurbFr: 'Un /16 réparti entre départements',
    base: '10.20.0.0/16',
    allowPointToPoint: false,
    explanation:
      'University campus scale: engineering needs thousands of addresses while voice and building management need only a few — classic VLSM territory.',
    explanationFr:
      'Échelle d’un campus universitaire : l’ingénierie demande des milliers d’adresses quand la téléphonie et la GTB en demandent quelques-unes.',
    requirements: [
      { name: 'Engineering', hosts: '4000' },
      { name: 'Sales', hosts: '1800' },
      { name: 'Marketing', hosts: '900' },
      { name: 'HR', hosts: '300' },
      { name: 'Finance', hosts: '120' },
      { name: 'Voice', hosts: '50' },
      { name: 'Building Mgmt', hosts: '20' },
      { name: 'WAN links', hosts: '2' },
    ],
  },
  {
    id: 'wan31',
    label: 'P2P links — /31 (RFC 3021)',
    labelFr: 'Liens P2P — /31 (RFC 3021)',
    blurb: 'Router-to-router links with /31',
    blurbFr: 'Liens routeur-à-routeur en /31',
    base: '10.255.0.0/24',
    allowPointToPoint: true,
    explanation:
      'Router-to-router infrastructure: /31 gives each link exactly two endpoint addresses with no broadcast (RFC 3021), and /32 loopbacks use a single address each.',
    explanationFr:
      'Infrastructure routeur-à-routeur : un /31 fournit exactement deux adresses de terminaison par lien sans diffusion (RFC 3021), et les boucles /32 une adresse chacune.',
    requirements: [
      { name: 'Link — HQ ↔ DC1', hosts: '2' },
      { name: 'Link — HQ ↔ DC2', hosts: '2' },
      { name: 'Link — DC1 ↔ DC2', hosts: '2' },
      { name: 'Loopback — Core', hosts: '1' },
      { name: 'Loopback — Edge', hosts: '1' },
    ],
  },
  {
    id: 'wan30',
    label: 'P2P links — traditional /30',
    labelFr: 'Liens P2P — /30 traditionnel',
    blurb: 'Same links with /30 subnets',
    blurbFr: 'Mêmes liens en sous-réseaux /30',
    base: '10.255.0.0/24',
    allowPointToPoint: false,
    explanation:
      'The same infrastructure without point-to-point mode: every 2-host link consumes a /30 (4 addresses), and single loopbacks still need a /30 — 50% waste per link.',
    explanationFr:
      'Même infrastructure sans le mode point-à-point : chaque lien à 2 hôtes consomme un /30 (4 adresses) et chaque boucle un /30 — 50 % de gaspillage par lien.',
    requirements: [
      { name: 'Link — HQ ↔ DC1', hosts: '2' },
      { name: 'Link — HQ ↔ DC2', hosts: '2' },
      { name: 'Link — DC1 ↔ DC2', hosts: '2' },
      { name: 'Loopback — Core', hosts: '1' },
      { name: 'Loopback — Edge', hosts: '1' },
    ],
  },
]

export function presetLabel(preset, lang = 'en') {
  return lang === 'fr' && preset.labelFr ? preset.labelFr : preset.label
}

export function presetBlurb(preset, lang = 'en') {
  return lang === 'fr' && preset.blurbFr ? preset.blurbFr : preset.blurb
}

export function presetExplanation(preset, lang = 'en') {
  return lang === 'fr' && preset.explanationFr ? preset.explanationFr : preset.explanation
}
