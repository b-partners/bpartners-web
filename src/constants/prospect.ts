const getI18NMap = (value: string) => `bp.action.prospect.${value}`;

export const PROSPECT_STATUS_BUTTON_MAP = {
  TO_CONTACT: {
    NOT_INTERESTED: getI18NMap('abandon'),
    CONTACTED: getI18NMap('reserve'),
    CONVERTED: getI18NMap('transformToClient'),
  },
  CONTACTED: {
    PROPOSAL_DECLINED: getI18NMap('abandon'),
    TO_CONTACT: getI18NMap('release'),
    CONVERTED: getI18NMap('transformToClient'),
  },
  CONVERTED: {
    PROPOSAL_DECLINED: getI18NMap('abandon'),
    TO_CONTACT: getI18NMap('releaseClient'),
    CONTACTED: getI18NMap('clientToProspect'),
  },
};
