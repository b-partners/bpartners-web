export const downloadBlobFile = async (blob: Blob, filename: string): Promise<void> => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  try {
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  } finally {
    URL.revokeObjectURL(url);
    a.remove();
  }
};
