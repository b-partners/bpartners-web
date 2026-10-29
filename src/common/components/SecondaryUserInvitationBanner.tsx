import { useIsSecondaryUser } from '@/common/hooks';
import { Redirect } from '@/common/utils';
import { acceptSecondaryUserInvitation, cache, getBackWhoami, getSecondaryUserInvitations } from '@/providers';
import { SecondaryUser } from '@bpartners/typescript-client';
import { Alert, Button } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { SecondaryUserInvitationBannerStyle } from './style';

const INVITATIONS_QUERY_KEY = ['SecondaryUserInvitationsQuery'];

export const SecondaryUserInvitationBanner = () => {
  const notify = useNotify();
  const isSecondaryUser = useIsSecondaryUser();
  const { data: invitations = [] } = useQuery<SecondaryUser[]>({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: () => getSecondaryUserInvitations().catch(() => []),
    enabled: !isSecondaryUser,
  });

  const { isPending, mutate: accept } = useMutation({
    mutationFn: async (invitationId: string) => {
      await acceptSecondaryUserInvitation(invitationId);
      cache.whoami(undefined);
      cache.user(undefined);
      await getBackWhoami();
    },
    onSuccess: () => Redirect.reload(),
    onError: (error: any) => notify(error?.response?.data?.message || error?.message || 'messages.global.error', { type: 'error' }),
  });

  if (isSecondaryUser || invitations.length === 0) return null;

  return (
    <>
      {invitations.map(({ id, email }) => (
        <Alert
          key={id}
          severity='info'
          sx={SecondaryUserInvitationBannerStyle}
          action={
            <Button color='inherit' size='small' name='accept-secondary-user-invitation' disabled={isPending} onClick={() => accept(id as string)}>
              Accepter
            </Button>
          }
        >
          {email ? `Le compte ${email} vous invite` : 'Un compte principal vous invite'} à utiliser son abonnement et ses crédits.
        </Alert>
      ))}
    </>
  );
};
