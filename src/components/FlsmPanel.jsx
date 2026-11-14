import { useState } from 'react'
import { calculateFlsm, flsmToCsv, flsmToText } from '../lib/flsm'
import { formatCount, parseCidr } from '../lib/vlsm'
import { AlertTriangle, Download } from './Icons'

function Field({ id, label, value, onChange, placeholder }) {
	return (
		<label className='field' htmlFor={id}>
			<span className='field__label'>{label}</span>
			<div className='field__shell'>
				<input
					id={id}
					className='field__input'
					type='number'
					min='1'
					value={value}
					placeholder={placeholder}
					inputMode='numeric'
					onChange={(event) => onChange(event.target.value)}
				/>
			</div>
		</label>
	)
}

/**
 * FLSM calculator panel — every subnet shares one common mask.
 * Internally separate from the VLSM engine; both reuse the same IPv4 utilities.
 */
export default function FlsmPanel({ baseInput, t, onCopyText, onExportCsv }) {
	const [subnetCount, setSubnetCount] = useState('4')
	const [hostsPerSubnet, setHostsPerSubnet] = useState('50')

	const base = parseCidr(baseInput)
	const parsedSubnets = Number(subnetCount)
	const parsedHosts = Number(hostsPerSubnet)
	const inputsValid =
		base.ok &&
		Number.isFinite(parsedSubnets) &&
		parsedSubnets >= 1 &&
		Number.isFinite(parsedHosts) &&
		parsedHosts >= 1

	const flsm = inputsValid
		? calculateFlsm(base, parsedSubnets, parsedHosts)
		: null

	return (
		<section className='panel'>
			<div className='panel__head panel__head--wrap'>
				<div className='panel__title-wrap'>
					<span className='panel__kicker'>FLSM</span>
					<h2 className='panel__title'>{t('modeFlsm')}</h2>
				</div>
				{flsm?.ok && (
					<div className='panel__actions'>
						<button
							type='button'
							className='btn btn--ghost btn--sm'
							onClick={() => onCopyText(`${flsmToText(flsm)}`)}>
							{t('exportText')}
						</button>
						<button
							type='button'
							className='btn btn--primary btn--sm'
							onClick={() => onExportCsv(flsmToCsv(flsm), 'flsm')}>
							<Download size={14} />
							{t('exportCsv')}
						</button>
					</div>
				)}
			</div>

			<div className='panel__body'>
				<div className='flsm-inputs'>
					<Field
						id='flsm-subnets'
						label={t('flsmSubnetCount')}
						value={subnetCount}
						onChange={setSubnetCount}
						placeholder='4'
					/>
					<Field
						id='flsm-hosts'
						label={t('flsmHostsPerSubnet')}
						value={hostsPerSubnet}
						onChange={setHostsPerSubnet}
						placeholder='50'
					/>
				</div>

				{!base.ok && (
					<div className='alert alert--warning' role='status'>
						<AlertTriangle size={16} />
						<div>
							<strong>{t('invalidCidr')}</strong>
							<p>{base.error}</p>
						</div>
					</div>
				)}

				{base.ok && flsm && !flsm.ok && (
					<div className='alert alert--danger' role='status'>
						<AlertTriangle size={16} />
						<div>
							<strong>{t('noSpace')}</strong>
							<p>{flsm.error}</p>
						</div>
					</div>
				)}

				{flsm?.ok && (
					<>
						<div className='parsed' style={{ marginTop: 14 }}>
							<div className='parsed__line'>
								<span className='parsed__net mono'>/{flsm.prefix}</span>
								<span className='parsed__prefix mono'>{flsm.subnetMask}</span>
							</div>
							<span className='parsed__meta'>
								{flsm.subnetBits} {t('flsmSubnetBits')} · {flsm.hostBits}{' '}
								{t('flsmHostBits')} · {formatCount(flsm.blockSize)}{' '}
								{t('addresses')} {t('perSubnet')} ·{' '}
								{formatCount(flsm.subnets[0].usable)} {t('usableColumn')}
							</span>
							<span className='parsed__meta parsed__meta--mono'>
								{t('mask')} {flsm.subnetMaskBinary}
							</span>
						</div>

						<div className='table-wrap' style={{ marginTop: 14 }}>
							<table className='data-table'>
								<thead>
									<tr>
										<th>#</th>
										<th>{t('cidr')}</th>
										<th>{t('usableRange')}</th>
										<th>{t('broadcast')}</th>
									</tr>
								</thead>
								<tbody>
									{flsm.subnets.map((subnet) => (
										<tr key={subnet.index}>
											<td>{subnet.index}</td>
											<td className='mono'>{subnet.cidr}</td>
											<td className='mono'>
												{subnet.first} → {subnet.last}
											</td>
											<td className='mono cell-mono'>
												{subnet.broadcast ?? '—'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{flsm.unusedSubnets > 0 && (
							<p className='flsm-note'>
								{formatCount(flsm.unusedSubnets)} {t('flsmUnusedSubnets')} ·{' '}
								{formatCount(flsm.summary.unusedAddresses)} {t('addresses')}{' '}
								{t('free')}
							</p>
						)}
					</>
				)}
			</div>
		</section>
	)
}
