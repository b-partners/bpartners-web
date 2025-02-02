export type RaInputChoice = { id: string; name: string; }
export const toRaInputChoices = (record: Record<string, string>, formatName?: (name: string, index: number) => string): RaInputChoice[] =>
  Object.entries(record).map(([id, name], index) => ({ id, name: formatName ? formatName(name, index) : name }));
