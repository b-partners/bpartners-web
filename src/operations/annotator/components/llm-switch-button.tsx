import { NOOP_FN } from '@/common/utils/noop_fn';
import { prodUrlPattern } from '@/constants';
import { Cached } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { FC } from 'react';

interface Props {
  enabled: boolean;
  onClick: typeof NOOP_FN;
}

export const LlmSwitchButton: FC<Props> = ({ enabled, onClick }) => {
  const isPreprod = !prodUrlPattern.test(window.location.href);

  return enabled && isPreprod ? (
    <Tooltip className='switch-llm-result-tooltip' title='Voir les conseils générés par notre IA'>
      <span>
        <IconButton size='large' className='switch-llm-result-button' onClick={onClick}>
          <Cached />
        </IconButton>
      </span>
    </Tooltip>
  ) : (
    <></>
  );
};
