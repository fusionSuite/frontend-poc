import { IProperty } from './Property';
import { IPropertygroup } from './Propertygroup';

export interface IType {
  id: number;
  name: string;
  internamename: string;
  modeling: string;
  created_at: string;
  updated_at: string;
  properties: IProperty[];
  propertygroups: IPropertygroup[];
}
  