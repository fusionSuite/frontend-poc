/**
 * FusionSuite - Frontend
 * Copyright (C) 2022 FusionSuite
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Injectable } from '@angular/core';
import { IUserparamsIds } from '../interfaces/UserparamsIds';

@Injectable({
  providedIn: 'root'
})
export class GlobalVarsService {

  public types :any[] = [];
  public userparams :IUserparamsIds = {
    itemlist: {
      id: 0,
      properties: {
        typeId: 0,
        elementsPerPage: 0,
        propertiesOrder: 0,
        propertieshidden: 0
      }
    },
    csvimport: {
      id: 0,
      properties: {
        typeId: 0,
        mappingCols: 0,
        joiningFields: 0
      }
    }  
  };

  constructor() {
    this.types = [
      {
        id: 0,
        name: "Create new type"
      }
    ];
  }
}
