export const stopPropagation = (onClick: () => void) => (e: ClipboardEvent) => {
  e.stopPropagation();
  onClick();
};
