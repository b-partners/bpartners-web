export const downloadPdf = async (url: string, filename = 'file.pdf') => {
  const res = await fetch(url);
  const blob = await res.blob();
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(fileUrl);
};
