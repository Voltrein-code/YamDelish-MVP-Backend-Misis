import { Star } from '@/components/icons/star'

export default function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className='flex justify-start gap-3'>
      <span className='text-base text-gray-600'>{label}:</span>
      <div className='flex w-full justify-between md:justify-normal md:space-x-2'>
        {Array.from({ length: 5 }).map((_, index) => (
          <button
            key={index}
            type='button'
            aria-label={`${label}: ${index + 1}`}
            onClick={() => onChange(index + 1)}
          >
            <Star
              className={
                index < value
                  ? 'h-6 w-6 fill-yellow-500 stroke-yellow-500'
                  : 'h-6 w-6 fill-white stroke-gray-800'
              }
            />
          </button>
        ))}
      </div>
    </div>
  )
}
