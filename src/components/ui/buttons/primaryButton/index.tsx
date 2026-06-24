interface PrimaryButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function PrimaryButton({
  children,
  type = 'button',
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className='rounded-lg bg-blue-500 py-2 text-base font-bold text-gray-100 hover:bg-blue-600 hover:text-gray-100 active:bg-blue-700 active:text-white'
    >
      {children}
    </button>
  )
}
