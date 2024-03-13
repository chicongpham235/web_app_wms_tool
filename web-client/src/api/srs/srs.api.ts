import { sdk } from "../axios";

export interface Srs {
  id: number | string;
  name: string;
  code: string;
  description: string;
}

export const SrsApi = {
  list: (params?: any) => sdk.get("srs", { params }),
};

export default SrsApi;
