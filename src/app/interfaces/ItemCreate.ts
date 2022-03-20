import { IItemCreateProperty } from './ItemCreateProperty';

export interface IItemCreate {
  name: string;
  type_id: number;
  properties: IItemCreateProperty[];
}
  