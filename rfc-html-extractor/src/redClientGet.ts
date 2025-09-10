import { ApiClient } from "../../client/generated/red-client.ts";

const redApiBase = process.env.RED_API_BASE ?? 'http://dt-datatracker.datatracker.svc/'

export const getRedClient = () => {
  return new ApiClient({
    baseUrl: redApiBase,
  });
};
