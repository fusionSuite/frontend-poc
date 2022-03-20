import { IProperty } from './Property';
import { IPropertygroup } from './Propertygroup';

export interface IItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  properties: IProperty[];
  propertygroups: IPropertygroup[];
}
  