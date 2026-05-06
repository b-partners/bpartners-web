---
name: react-component
description: Generate TypeScript + MUI React components in a two-file structure (Name.tsx + style.ts). Use when creating, adding, or scaffolding any .tsx element — components, pages, forms, cards, dialogs, modals, layouts — even when the user doesn't say "component" (e.g. "add a login form", "make a user card", "build the dashboard").
---

# React Component Skill

Baseline rules live in `CLAUDE.md`. This skill covers templates and generation workflow.

## Output

Each component is its own folder:

current folder path/
├── ComponentName.tsx
└── style.ts

Add `ComponentName.test.tsx` only if tests are requested.

## Templates

### `style.ts`

```ts
import { SxProps } from '@mui/material';

export const ComponentNameStyle: SxProps = {
  '& .child-class': {},
};
```

### `ComponentName.tsx` — no props

```tsx
import { Box } from '@mui/material';
import { ComponentNameStyle } from './style';

export const ComponentName = () => <Box sx={ComponentNameStyle} />;
```

### `ComponentName.tsx` — with props

```tsx
import { FC } from 'react';
import { Box } from '@mui/material';
import { ComponentNameStyle } from './style';

interface ComponentNameProps {
  propA: string;
}

export const ComponentName: FC<ComponentNameProps> = props => <Box sx={ComponentNameStyle} />;
```

### `ComponentName.test.tsx` — only when asked

```tsx
import { render } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders', () => {
    render(<ComponentName />);
  });
});
```

## Workflow

1. Pick PascalCase name
2. Plan child `className` values (kebab-case) upfront
3. Write `style.ts` first, then `ComponentName.tsx`, then test if requested
4. Output each file in its own code block, with the path as header (e.g. `### ComponentName/style.ts`)
