# VLSM Studio

A visual **Variable Length Subnet Mask (VLSM)** planner for IPv4, built with React and Vite.

Enter a base network and a list of host requirements. VLSM Studio sizes each subnet, packs it into the address space, and shows the result as a live address map, allocation table, and exportable CSV.

## Features

- **Live VLSM allocation** — requests are rounded up to power-of-two blocks, sorted largest-first, and aligned to their own boundaries.
- **Base network normalization** — `192.168.10.77/26` is automatically interpreted as `192.168.10.64/26`.
- **Address-space map** — a proportional bar chart of allocated subnets and free gaps.
- **Allocation table** — CIDR, mask, usable range, suggested gateway, broadcast, block size, and efficiency per subnet.
- **Failure reporting** — explains why a request couldn't fit instead of silently dropping it.
- **Point-to-point mode** — sizes 2-host links as `/31` and 1-host links as `/32` (RFC 3021).
- **Scenario presets** — branch office, campus core, data center, and WAN links.
- **CSV export & clipboard copy** — export the full plan or copy a single subnet's details.
- **Dark / light theme, responsive layout, and local persistence** — your plan survives a page refresh.

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite (defaults to `http://localhost:5173`).

```bash
npm run build     # production build in dist/
npm run preview   # preview the production build
npm test          # run the VLSM math test suite
```

## How the allocation works

1. Convert the base CIDR to a network address and broadcast address.
2. For each requirement, reserve the network and broadcast addresses and find the smallest power of two that fits the requested hosts.
3. Sort requirements by block size, largest first.
4. Place each block at the next aligned address inside the base network.
5. Report any block that no longer fits. Smaller remaining requests can still be placed.
6. Collect unallocated gaps as free space.

Example with `192.168.10.0/24`:

| Requirement | Hosts | Block | CIDR | Usable range |
| --- | ---: | ---: | --- | --- |
| Staff LAN | 60 | 64 | `192.168.10.0/26` | `.1 – .62` |
| Guest Wi-Fi | 25 | 32 | `192.168.10.64/27` | `.65 – .94` |
| Servers | 12 | 16 | `192.168.10.96/28` | `.97 – .110` |
| Printers | 6 | 8 | `192.168.10.112/29` | `.113 – .118` |
| Management | 4 | 8 | `192.168.10.120/29` | `.121 – .126` |
| WAN uplink | 2 | 4 | `192.168.10.128/30` | `.129 – .130` |

Free space: `192.168.10.132 – 192.168.10.255` (124 addresses).

## Project structure

```
src/
  App.jsx                    app state, persistence, actions
  components/
    AddressMap.jsx           proportional address-space visualization
    EmptyState.jsx           onboarding and scenario shortcuts
    Icons.jsx                inline SVG icon set
    NetworkForm.jsx          base network + options
    RequirementsPanel.jsx    subnet requirement editor
    ResultsTable.jsx         allocation table, CSV/copy actions
    SummaryCards.jsx         plan statistics
    Toast.jsx                transient feedback
  lib/
    vlsm.js                  pure allocation math, parsing, exports
    vlsm.test.js             node:test suite
    presets.js               example scenarios
    palette.js               subnet colors
  index.css                 theme tokens and responsive styles
```

## Notes

- Prefix lengths `0–32` are supported for the base network.
- Host counts must be whole numbers from `1` to `4,294,967,294`.
- In classic mode, a 1-host subnet still consumes a `/30` (4 addresses). Enable **point-to-point mode** to use `/31` and `/32` instead.
- The suggested gateway is the first usable address in each subnet.
