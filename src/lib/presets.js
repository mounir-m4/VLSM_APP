/**
 * Ready-to-explore scenarios. Host counts are strings so they map directly
 * into the text inputs.
 */
export const PRESETS = [
  {
    id: 'office',
    label: 'Branch office',
    blurb: 'Six VLANs squeezed into a /24',
    base: '192.168.10.0/24',
    allowPointToPoint: false,
    requirements: [
      { name: 'Staff LAN', hosts: '60' },
      { name: 'Guest Wi-Fi', hosts: '25' },
      { name: 'Servers', hosts: '12' },
      { name: 'Printers', hosts: '6' },
      { name: 'Management', hosts: '4' },
      { name: 'WAN uplink', hosts: '2' },
    ],
  },
  {
    id: 'campus',
    label: 'Campus core',
    blurb: 'A /16 split across departments',
    base: '10.20.0.0/16',
    allowPointToPoint: false,
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
    id: 'datacenter',
    label: 'Data center',
    blurb: 'A tight /22 for application tiers',
    base: '172.16.4.0/22',
    allowPointToPoint: false,
    requirements: [
      { name: 'Web tier', hosts: '200' },
      { name: 'App tier', hosts: '120' },
      { name: 'Database tier', hosts: '60' },
      { name: 'Cache layer', hosts: '25' },
      { name: 'Bastion', hosts: '6' },
      { name: 'Out-of-band', hosts: '2' },
    ],
  },
  {
    id: 'wan',
    label: 'WAN links',
    blurb: 'Point-to-point mode with /31 and /32',
    base: '10.255.0.0/24',
    allowPointToPoint: true,
    requirements: [
      { name: 'Link — HQ ↔ DC1', hosts: '2' },
      { name: 'Link — HQ ↔ DC2', hosts: '2' },
      { name: 'Link — DC1 ↔ DC2', hosts: '2' },
      { name: 'Link — HQ ↔ Branch', hosts: '2' },
      { name: 'Loopback — Core', hosts: '1' },
      { name: 'Loopback — Edge', hosts: '1' },
    ],
  },
]
