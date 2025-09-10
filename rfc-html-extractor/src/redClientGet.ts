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

export const getRfcCommon = async (rfcNumber: number): Promise<RfcCommon> => {
  console.log("Getting API client")
  const api = getRedClient()
  console.log("Got API client", api)
  console.log("docRetrive", rfcNumber)
  const rfc = await api.red.docRetrieve(rfcNumber)
  console.log("after docRetrieve", api)
  const rfcCommon = rfcToRfcCommon(rfc)
  console.log("after docRetrieve common", api)
  return rfcCommon
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