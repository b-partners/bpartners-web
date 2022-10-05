export const getMimeType = e => {
  const file = e.target.files[0]
  return file.type
}
