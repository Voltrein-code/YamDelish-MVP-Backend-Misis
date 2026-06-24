import PrimaryButton from '@/components/ui/buttons/primaryButton'

interface OrderSummaryProps {
  totalPrice: string
  totalItems: string
  disabled?: boolean
  onCheckout: () => void
}

export default function OrderSummary({
  totalPrice,
  totalItems,
  disabled = false,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <>
      {/* Десктоп */}
      <div className='hidden w-full max-w-[17.5rem] gap-3 rounded-md bg-white px-4 py-3 lg:flex lg:w-1/4 lg:flex-col lg:self-start'>
        <h3 className='text-base font-bold text-gray-800'>Общая сумма заказа</h3>
        <div className='flex w-full flex-col gap-1'>
          <span className='truncate text-sm text-gray-600'>{totalItems} блюда</span>
          <span className='font-roboto flex-1 text-2xl font-bold text-green-500'>{totalPrice}</span>
        </div>
        <PrimaryButton type='button' fullWidth disabled={disabled} onClick={onCheckout}>
          Оформление заказа
        </PrimaryButton>
      </div>

      {/* Мобильный */}
      <div className='flex w-full flex-col gap-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 lg:hidden'>
        <h3 className='text-base font-bold text-gray-800'>Общая сумма заказа</h3>
        <div className='flex w-full items-center justify-between'>
          <span className='font-roboto flex-1 text-2xl font-bold text-green-500'>{totalPrice}</span>
          <span className='truncate text-sm text-gray-600'>{totalItems} блюда</span>
        </div>
        <PrimaryButton type='button' fullWidth disabled={disabled} onClick={onCheckout}>
          Оформление заказа
        </PrimaryButton>
      </div>
    </>
  )
}
