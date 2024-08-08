// this is for type in datetime input in cypress cause do it like for text input do not work
// as it is said in the github issues https://github.com/cypress-io/cypress/issues/1366#issuecomment-385246005
export const setDateTime = (value: string) => (input: JQuery<HTMLElement>) => {
  input[0].dispatchEvent(new Event('input', { bubbles: true }));
  input.val(value);
};
