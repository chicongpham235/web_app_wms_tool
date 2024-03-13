import { sdk } from "../axios";

export interface ConvertedLayer {
  id: string;
  layer_name: string;
  geoserver_ref: string;
  srs: string;
  uuid: string;
  metadata: any;
  created_at?: Date;
  updated_at?: Date;
}

export const ConvertedLayerApi = {
  listAgGrid: (params?: any) => sdk.post("converted-layer-list", params),
  download: (id: string, params: any) =>
    sdk.post(`converted-layers/${id}/download`, params),
};

export default ConvertedLayerApi;
