export const translations = {
	en: {
		// Header
		appTitle: 'VLSM Studio',
		appSubtitle: 'Variable Length Subnet Mask planner for IPv4',

		// Theme toggle
		themeLight: 'Light mode',
		themeDark: 'Dark mode',

		// Mode switcher
		modeVlsm: 'VLSM',
		modeFlsm: 'FLSM',
		modeSwitchLabel: 'Calculation mode',
		modeVlsmHint:
			'Different subnet sizes based on individual host requirements.',
		modeFlsmHint: 'Equal-sized subnets sharing one common mask.',
		flsmSubnetCount: 'Number of subnets',
		flsmHostsPerSubnet: 'Hosts per subnet',
		flsmSubnetBits: 'subnet bits',
		flsmHostBits: 'host bits',
		perSubnet: 'per subnet',
		flsmUnusedSubnets: 'unused equal subnets remain',
		requestedShort: 'requested',

		// Empty state
		emptyTitle: 'Live planner',
		emptyDescription:
			'Enter a base network and add subnet requirements to see the VLSM allocation.',
		loadPreset: 'Load a scenario',

		// Network form
		sectionFoundation: 'FOUNDATION',
		hostBitsCleared: 'Host bits cleared',
		noPrefixSupplied: 'No prefix supplied',
		assumed: 'assumed',
		noPrefixAssumed:
			'No prefix? /24 is assumed. The block is normalized to its network address.',
		chooseScenario: 'Choose a scenario…',
		startFromExample: 'Start from an example',
		scenarioAbout: 'About this scenario',
		baseNetwork: 'Base network',
		baseNetworkPlaceholder: 'IPv4 block in CIDR',
		addresses: 'addresses',
		usableHosts: 'usable hosts',
		mask: 'mask',
		options: 'Options',
		allowP2P: 'Allow point-to-point',
		allowP2PDescription:
			'/31 links use both addresses as endpoints (RFC 3021); /32 is a single host route',
		gatewayMode: 'Automatic gateway',
		gatewayFirst: 'First usable',
		gatewayLast: 'Last usable',
		gatewayNone: 'None',
		gatewayModeHint:
			'Applies to traditional subnets only — /32 host routes never get a gateway.',

		// Requirements panel
		sectionRequirements: 'REQUIREMENTS',
		subnets: 'Subnets',
		subnetStep: 'Subnet',
		noRequirements: 'No subnet requirements yet.',
		noRequirementsHint: 'Add one below to start allocating.',
		requirementsCount: 'requirements',
		requirementSingle: 'requirement',
		hostsRequested: 'hosts requested',
		blocksSortedNote:
			'Blocks are sized automatically and sorted largest-first.',
		removeSubnet: 'Remove subnet',
		moveUp: 'Move up',
		moveDown: 'Move down',
		nameForSubnet: 'Name for subnet',
		requiredHostsFor: 'Required hosts for subnet',
		enterHostCount: 'Enter a host count',
		invalidHostFormat: 'Use a whole number (1 or more)',
		invalidHostZero: 'At least 1 host is required',
		invalidHostTooLarge: 'Exceeds the IPv4 capacity',
		addressesBlock: 'addresses',
		requirementsSubtitle: 'Subnet name and host count',
		hosts: 'Hosts',
		addRequirement: 'Add requirement',
		clearAll: 'Clear all',
		resetAll: 'Reset planner',

		// Presets
		presetBranchOffice: 'Branch office',
		presetCampusCore: 'Campus core',
		presetDataCenter: 'Data center',
		presetWanLinks: 'WAN links',

		// Summary cards
		summary: 'Summary',
		totalAllocated: 'Space allocated',
		freeSpace: 'Free space',
		efficiency: 'Host efficiency',
		spaceUtilization: 'Space utilization',
		remainingCapacity: 'Remaining capacity',
		subnetCountLabel: 'Subnets',
		subnet: 'Subnet',
		requestedHostsLabel: 'Requested hosts',

		// Learning mode
		learningMode: 'Learning mode',
		learningModeHint: 'Show how each subnet is calculated, step by step.',
		learningShow: 'Show calculation',
		learningHide: 'Hide calculation',
		learningWorked: 'Worked example — 100 hosts',

		// Results table
		sectionAllocation: 'ALLOCATION',
		requirement: 'Requirement',
		cidr: 'CIDR',
		netmask: 'Netmask',
		usableRange: 'Usable range',
		gateway: 'Gateway',
		broadcast: 'Broadcast',
		blockSize: 'Block',
		waste: 'Waste',
		usableColumn: 'usable',
		viewDetails: 'View details',
		detailsTitle: 'Subnet details',
		detailsMaskBinary: 'Mask (binary)',
		detailsNetwork: 'Network address',
		detailsFirstIp: 'First usable IP',
		detailsLastIp: 'Last usable IP',
		detailsBroadcast: 'Broadcast address',
		detailsNoBroadcast: 'None — RFC 3021 point-to-point link',
		detailsNoBroadcastHost: 'None — single host route',
		detailsTotalAddresses: 'Total addresses',
		detailsUsableCapacity: 'Usable host capacity',
		detailsRequested: 'Requested hosts',
		detailsRemaining: 'Remaining usable capacity',
		detailsEfficiency: 'Host efficiency',
		detailsSpaceUtil: 'Address-space utilization',
		detailsKindLan: 'Traditional subnet',
		detailsKindP2p: 'Point-to-point link (RFC 3021)',
		detailsKindHost: 'Host route (/32)',
		detailsClose: 'Close details',
		copyValue: 'Copy',

		// Actions
		copyRow: 'Copy plan',
		exportCsv: 'Export CSV',
		exportPdf: 'Export PDF',
		exportText: 'Copy text plan',
		copiedToClipboard: 'Copied to clipboard',

		// Address map
		addressSpace: 'Address space',
		hierarchicalView: 'Hierarchical view',
		hierarchicalHint: 'The base network divided into its allocated blocks',
		free: 'Free',
		freeSpaceColor: 'Unallocated',
		mapTooltipEfficiency: 'Efficiency',

		// Errors & validation
		invalidCidr: 'Invalid CIDR notation',
		invalidHosts: 'Some host counts aren’t usable.',
		noSpace: 'no space available',
		baseNeedsAttention: 'Base network needs attention',
		tryPrefix: 'Try',
		orLoadScenario: 'or load a scenario from the sidebar.',
		invalidHostCountsDetail: 'Enter a whole number from 1 to',
		invalidRowsSkipped: 'Invalid rows are skipped in the plan.',
		couldNotPlace: 'couldn’t be placed.',
		ranOutOfSpace:
			'ran out of contiguous space. Enlarge the base block or lower the host counts — the details are listed under the allocation table.',
		couldNotPlaceReq: 'Couldn’t place',
		unnamedSubnet: 'Unnamed subnet',
		noSubnetFound: 'No subnet found a home in this base network.',
		copySubnetDetails: 'Copy subnet details',
		footerNote:
			'Each request is rounded up to the nearest power-of-two block, sorted largest first and aligned to its own boundary. Failed requests never disturb later allocations. Point-to-point mode follows RFC 3021: /31 links use both addresses as endpoints with no broadcast; /32 is a single host route.',
		footerRepoDesc: 'Open source — star or report an issue on GitHub.',

		// Units
		host_one: 'host',
		host_other: 'hosts',
	},

	fr: {
		// Header
		appTitle: 'VLSM Studio',
		appSubtitle:
			'Planificateur de masque de sous-réseau à longueur variable pour IPv4',

		// Theme toggle
		themeLight: 'Mode clair',
		themeDark: 'Mode sombre',

		// Mode switcher
		modeVlsm: 'VLSM',
		modeFlsm: 'FLSM',
		modeSwitchLabel: 'Mode de calcul',
		modeVlsmHint:
			'Tailles de sous-réseaux différentes selon les besoins en hôtes.',
		modeFlsmHint: 'Sous-réseaux de taille égale partageant un masque commun.',
		flsmSubnetCount: 'Nombre de sous-réseaux',
		flsmHostsPerSubnet: 'Hôtes par sous-réseau',
		flsmSubnetBits: 'bits de sous-réseau',
		flsmHostBits: 'bits d’hôte',
		perSubnet: 'par sous-réseau',
		flsmUnusedSubnets: 'sous-réseaux égaux inutilisés restent',
		requestedShort: 'demandés',

		// Empty state
		emptyTitle: 'Planificateur en direct',
		emptyDescription:
			"Entrez un réseau de base et ajoutez des exigences de sous-réseau pour voir l'allocation VLSM.",
		loadPreset: 'Charger un scénario',

		// Network form
		sectionFoundation: 'FONDATION',
		hostBitsCleared: "Bits d'hôte effacés",
		noPrefixSupplied: 'Aucun préfixe fourni',
		assumed: 'supposé',
		noPrefixAssumed:
			'Pas de préfixe ? /24 est supposé. Le bloc est normalisé à son adresse réseau.',
		chooseScenario: 'Choisir un scénario…',
		startFromExample: 'Commencer avec un exemple',
		scenarioAbout: 'À propos de ce scénario',
		baseNetwork: 'Réseau de base',
		baseNetworkPlaceholder: 'Bloc IPv4 en notation CIDR',
		addresses: 'adresses',
		usableHosts: 'hôtes utilisables',
		mask: 'masque',
		options: 'Options',
		allowP2P: 'Autoriser point-à-point',
		allowP2PDescription:
			'Les liens /31 utilisent leurs deux adresses comme points de terminaison (RFC 3021) ; le /32 est une route d’hôte unique',
		gatewayMode: 'Passerelle automatique',
		gatewayFirst: 'Première utilisable',
		gatewayLast: 'Dernière utilisable',
		gatewayNone: 'Aucune',
		gatewayModeHint:
			'S’applique aux sous-réseaux traditionnels uniquement — une route d’hôte /32 n’a jamais de passerelle.',

		// Requirements panel
		sectionRequirements: 'EXIGENCES',
		subnets: 'Sous-réseaux',
		subnetStep: 'Sous-réseau',
		noRequirements: 'Aucune exigence de sous-réseau pour le moment.',
		noRequirementsHint:
			"Ajoutez-en une ci-dessous pour commencer l'allocation.",
		requirementsCount: 'exigences',
		requirementSingle: 'exigence',
		hostsRequested: 'hôtes demandés',
		blocksSortedNote:
			'Les blocs sont dimensionnés automatiquement et triés du plus grand au plus petit.',
		removeSubnet: 'Supprimer le sous-réseau',
		moveUp: 'Monter',
		moveDown: 'Descendre',
		nameForSubnet: 'Nom du sous-réseau',
		requiredHostsFor: 'Hôtes requis pour le sous-réseau',
		enterHostCount: "Entrez un nombre d'hôtes",
		invalidHostFormat: 'Utilisez un nombre entier (1 ou plus)',
		invalidHostZero: 'Au moins 1 hôte est requis',
		invalidHostTooLarge: 'Dépasse la capacité IPv4',
		addressesBlock: 'adresses',
		requirementsSubtitle: "Nom du sous-réseau et nombre d'hôtes",
		hosts: 'Hôtes',
		addRequirement: 'Ajouter une exigence',
		clearAll: 'Tout effacer',
		resetAll: 'Réinitialiser',

		// Presets
		presetBranchOffice: 'Succursale',
		presetCampusCore: 'Noyau du campus',
		presetDataCenter: 'Centre de données',
		presetWanLinks: 'Liens WAN',

		// Summary cards
		summary: 'Résumé',
		totalAllocated: 'Espace alloué',
		freeSpace: 'Espace libre',
		efficiency: 'Efficacité d’hôtes',
		spaceUtilization: "Utilisation de l'espace",
		remainingCapacity: 'Capacité restante',
		subnetCountLabel: 'Sous-réseaux',
		subnet: 'Sous-réseau',
		requestedHostsLabel: 'Hôtes demandés',

		// Learning mode
		learningMode: 'Mode apprentissage',
		learningModeHint:
			'Affiche comment chaque sous-réseau est calculé, étape par étape.',
		learningShow: 'Voir le calcul',
		learningHide: 'Masquer le calcul',
		learningWorked: 'Exemple détaillé — 100 hôtes',

		// Results table
		sectionAllocation: 'ALLOCATION',
		requirement: 'Exigence',
		cidr: 'CIDR',
		netmask: 'Masque réseau',
		usableRange: 'Plage utilisable',
		gateway: 'Passerelle',
		broadcast: 'Diffusion',
		blockSize: 'Bloc',
		waste: 'Gaspillage',
		usableColumn: 'utilisables',
		viewDetails: 'Voir les détails',
		detailsTitle: 'Détails du sous-réseau',
		detailsMaskBinary: 'Masque (binaire)',
		detailsNetwork: 'Adresse réseau',
		detailsFirstIp: 'Première IP utilisable',
		detailsLastIp: 'Dernière IP utilisable',
		detailsBroadcast: 'Adresse de diffusion',
		detailsNoBroadcast: 'Aucune — lien point-à-point RFC 3021',
		detailsNoBroadcastHost: 'Aucune — route d’hôte unique',
		detailsTotalAddresses: 'Adresses totales',
		detailsUsableCapacity: "Capacité d'hôtes utilisable",
		detailsRequested: 'Hôtes demandés',
		detailsRemaining: 'Capacité utilisable restante',
		detailsEfficiency: 'Efficacité d’hôtes',
		detailsSpaceUtil: "Utilisation de l'espace d'adressage",
		detailsKindLan: 'Sous-réseau traditionnel',
		detailsKindP2p: 'Lien point-à-point (RFC 3021)',
		detailsKindHost: 'Route d’hôte (/32)',
		detailsClose: 'Fermer les détails',
		copyValue: 'Copier',

		// Actions
		copyRow: 'Copier le plan',
		exportCsv: 'Exporter CSV',
		exportPdf: 'Exporter PDF',
		exportText: 'Copier le plan texte',
		copiedToClipboard: 'Copié dans le presse-papiers',

		// Address map
		addressSpace: "Espace d'adressage",
		hierarchicalView: 'Vue hiérarchique',
		hierarchicalHint: 'Le réseau de base divisé en blocs alloués',
		free: 'Libre',
		freeSpaceColor: 'Non alloué',
		mapTooltipEfficiency: 'Efficacité',

		// Errors & validation
		invalidCidr: 'Notation CIDR invalide',
		invalidHosts: "Certains nombres d'hôtes ne sont pas utilisables.",
		noSpace: 'aucun espace disponible',
		baseNeedsAttention: 'Le réseau de base nécessite votre attention',
		tryPrefix: 'Essayez',
		orLoadScenario: 'ou chargez un scénario depuis la barre latérale.',
		invalidHostCountsDetail: 'Entrez un nombre entier de 1 à',
		invalidRowsSkipped: 'Les lignes invalides sont ignorées dans le plan.',
		couldNotPlace: "n'ont pas pu être placés.",
		ranOutOfSpace:
			"a manqué d'espace contigu. Agrandissez le bloc de base ou réduisez les nombres d'hôtes — les détails sont listés sous le tableau d'allocation.",
		couldNotPlaceReq: 'Impossible de placer',
		unnamedSubnet: 'Sous-réseau sans nom',
		noSubnetFound:
			"Aucun sous-réseau n'a trouvé de place dans ce réseau de base.",
		copySubnetDetails: 'Copier les détails du sous-réseau',
		footerNote:
			'Chaque demande est arrondie au bloc puissance de deux le plus proche, triée du plus grand au plus petit et alignée sur sa propre limite. Les demandes en échec ne perturbent jamais les allocations suivantes. Le mode point-à-point suit la RFC 3021 : un lien /31 utilise ses deux adresses comme points de terminaison sans diffusion ; un /32 est une route d’hôte unique.',
		footerRepoDesc:
			'Open source — participez ou signalez un problème sur GitHub.',

		// Units
		host_one: 'hôte',
		host_other: 'hôtes',
	},
}

export const LANGUAGES = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function getTranslation(lang, key) {
	return translations[lang]?.[key] || translations.en[key] || key
}
