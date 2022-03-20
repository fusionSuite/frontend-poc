import { IListvalue } from "./Listvalue";

export interface IProperty {
  id: number;
  name: string;
  internamename: string;
  valuetype: string;
  unit: string;
  default: string;
  description: null|string;
  created_at: string;
  updated_at: string;
  listvalues: IListvalue[];
  value: string;
  byfusioninventory: boolean;
}
  