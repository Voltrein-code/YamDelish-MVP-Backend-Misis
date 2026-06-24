const checkfile = (file: File) => {
  const maxSize = 5 * 1024 * 1024
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']

  return file.size <= maxSize && validTypes.includes(file.type)
}

export default checkfile
