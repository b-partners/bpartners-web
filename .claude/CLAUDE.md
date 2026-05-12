# Project Instructions

**Stack:** TypeScript + React + MUI. Never JS unless asked.

**Skill:** `.claude/skills/react-component/` — invoke for any `.tsx` work (component, page, form, dialog, etc.), even if not named.

## Rules

- Arrow functions only. No `function` keyword. No comments inside function bodies.
- Use spread (`...`) for props forwarding and merging.
- `export const` only — never `export default`.
- Component with props → `interface [Name]Props` + `FC<[Name]Props>`. Without props → plain arrow function, no typing.
- Styles live in a sibling `style.ts` as `[Name]Style: SxProps`. Apply `sx` only on the parent. Style children via `className` + `& .class` selectors. No inline `sx={{...}}`.
- Per component: `Name.tsx` + `style.ts`. Add `Name.test.tsx` only if tests are requested.

## Example

```ts
// style.ts
import { SxProps } from '@mui/material';

export const AppStyle: SxProps = {
  bgcolor: 'red',
  '& .text-title': { color: 'white' },
};
```

```tsx
// App.tsx
import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { AppStyle } from './style';

interface AppProps {
  title: string;
}

export const App: FC<AppProps> = ({ title, ...rest }) => (
  <Box sx={AppStyle} {...rest}>
    <Typography className='text-title'>{title}</Typography>
  </Box>
);
```

## Communication

Answer directly. Explanations outside code blocks. When editing, skip reprinting `style.ts` if unchanged — just note `style.ts — unchanged`.
