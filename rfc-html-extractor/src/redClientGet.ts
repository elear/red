import { ApiClient } from "../../client/generated/red-client.ts";
import { parseRfcStatusSlug } from "../../client/app/utilities/rfc-converter-status.ts";
import { blankRfcCommon } from "./rfc.ts";
import type { Rfc } from "../../client/generated/red-client.ts";
import type { RfcCommon } from "../../client/app/utilities/rfc-validators.ts";

const redApiBase = process.env.RED_API_BASE ?? 'http://dt-datatracker.datatracker.svc/'

export const getRedClient = () => {
  return new ApiClient({
    baseUrl: redApiBase,
  });
};

export const getRfc = async (rfcNumber: number): Promise<RfcCommon> => {
  const api = getRedClient()

  const rfc = await api.red.docRetrieve(rfcNumber)

  return rfcToRfcCommon(rfc)
}

export const rfcToRfcCommon = (rfc: Rfc): RfcCommon => {
  return {
    ...blankRfcCommon,
    number: rfc.number,
    abstract: rfc.abstract,
    published: rfc.published,
    status: parseRfcStatusSlug(rfc.status.slug),
    pages: rfc.pages,
    authors: rfc.authors,
    group: rfc.group,
    area: rfc.area,
    stream: rfc.stream,
    identifiers: rfc.identifiers,
    obsoleted_by: rfc.obsoleted_by,
    updated_by: rfc.updated_by,
    title: rfc.title
  }
}