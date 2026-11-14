import { Check } from './Icons'

export default function Toast({ message }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <Check size={16} />
      <span>{message}</span>
    </div>
  )
}
