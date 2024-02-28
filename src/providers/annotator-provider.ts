import { annotations } from "src/__tests__/mocks/responses/annotator-api";

export const annotatorProvider = async () => {
    return Promise.resolve(annotations);
  };