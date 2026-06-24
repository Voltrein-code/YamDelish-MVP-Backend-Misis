interface FormInputProps {
  label: string
  id: string
  type: string
  placeholder?: string
  autoComplete?: string
  pattern?: string
  minLength?: number
  maxLength?: number
  required?: boolean
  defaultValue?: string
  readOnly?: boolean
}

export default function FormInput({
  label,
  id,
  type,
  placeholder,
  autoComplete,
  pattern,
  minLength,
  maxLength,
  required = true,
  defaultValue,
  readOnly = false,
}: FormInputProps) {
  return (
    <div className='flex flex-col gap-0.5 lg:gap-1'>
      <label className='text-xs text-gray-500' htmlFor={id}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className='w-full rounded border border-gray-300 px-2 py-1.5 text-gray-800 placeholder:text-sm placeholder:text-gray-400 read-only:cursor-not-allowed read-only:bg-gray-100 read-only:text-gray-500 hover:border-gray-400 focus:border-blue-500 focus:outline-none lg:placeholder:text-base'
      />
    </div>
  )
}
