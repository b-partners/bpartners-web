export const TRANSACTION_STATUSES = {
  PENDING: { label: 'En attente', color: 'orange' },
  UPCOMING: { label: 'En traitement', color: 'orange' },
  BOOKED: { label: 'Acceptée', color: 'green' },
  REJECTED: { label: 'Rejetée', color: 'red' },
  UNKNOWN: {
    // Internally, we use this status to handle e.g. any new status introduced by backend and not handle yet frontend-side.
    // Visually, we must avoid displaying to users that status is unknown: we must display re-assuring message instead!
    label: 'Inconnue',
    color: 'gray',
  },
};
