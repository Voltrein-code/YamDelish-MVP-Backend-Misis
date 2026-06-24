type ProfileDeleteButtonProps = {
  className?: string
}

export default function ProfileDeleteButton({ className = '' }: ProfileDeleteButtonProps) {
  return (
    <button type='button' className={`text-blue-500 hover:underline ${className}`}>
      Удалить аккаунт
    </button>
  )
}
