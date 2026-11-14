import { LANGUAGES } from '../lib/translations'

export default function LanguageToggle({ currentLang, onLanguageChange }) {
	return (
		<div className='language-toggle'>
			{LANGUAGES.map((lang) => (
				<button
					key={lang.code}
					onClick={() => onLanguageChange(lang.code)}
					className={`language-button ${currentLang === lang.code ? 'active' : ''}`}
					title={lang.name}
					aria-label={`Switch to ${lang.name}`}>
					<span className='flag'>{lang.flag}</span>
					<span className='lang-code'>{lang.code.toUpperCase()}</span>
				</button>
			))}
		</div>
	)
}
