import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { whoami } from './responses/security-api';

const server = setupServer(
  rest.get(`/whoami`, (_req, res, ctx) => {
    return res(ctx.json(whoami));
  })
);

export default server;
