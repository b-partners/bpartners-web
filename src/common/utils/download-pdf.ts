const LINK_ID = 'bp-download-pdf-link';
const SPACING_MS = 800;

export const downloadPdf = async (url: string, filename = 'file.pdf') => {
  const previous = document.getElementById(LINK_ID) as HTMLAnchorElement | null;
  if (previous) {
    URL.revokeObjectURL(previous.href);
    document.body.removeChild(previous);
  }

  const res = await fetch(url);
  const blob = await res.blob();
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.id = LINK_ID;
  link.href = fileUrl;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  await new Promise(resolve => setTimeout(resolve, SPACING_MS));
};
