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
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { GlobalVarsService } from './global-vars.service';
import {catchError, map} from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  public token = '';
  public initialized: any = new BehaviorSubject(false);


  constructor(
    private http: HttpClient, 
    public globalVars: GlobalVarsService,
    private settingsService: SettingsService
    ) {

  }

  public async login() {
    const data = {
      login: 'admin',
      password: 'admin',
    };
    await this.http.post(this.settingsService.url + '/v1/token', data)
      .pipe(map((res :any) => {
        this.token = res['token'];
      }))
      .toPromise();
  }

  public async getTypes() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };

    return await this.http.get(this.settingsService.url + '/v1/cmdb/types', httpOptions)
      .pipe(map(res => {
        for (const type of Object.values(res)) {
          this.globalVars.types.push(type);
        }
        return res;
      }))
      .toPromise();
  }

  public getTypeProperties() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };

    return this.http.get(this.settingsService.url + '/v1/cmdb/typeproperties', httpOptions);
  }

  public getType(id: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };

    return this.http.get(this.settingsService.url + '/v1/cmdb/types/' + id, httpOptions);
  }

  /**
   * Create a new type.
   * 
   * @param name the name of the type
   * @param properties list of id of the properties to set to this type
   */
  public async createType(name :string, groups :any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };
    let ret :any = await this.http.post(this.settingsService.url + '/v1/cmdb/types', {name}, httpOptions).toPromise();
    if (ret['id']) {
      console.log(groups);
      let position = 1;
      for (let group of groups) {
        let propertiesOfGroup = [];
        for (let propertyId of group.properties) {
          await this.http.post(this.settingsService.url + '/v1/cmdb/types/' + ret['id'] + '/property/' + propertyId, {}, httpOptions).toPromise();
          propertiesOfGroup.push(propertyId);
        }
        // TODO create group
        await this.http.post(this.settingsService.url + '/v1/cmdb/types/' + ret['id'] + '/propertygroups', {name: group.name, properties: propertiesOfGroup, position}, httpOptions).toPromise();
        position += 1;
      }
    }
    return ret['id'];
  }


  public createTypeProperty(data :any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };
    return this.http.post(this.settingsService.url + '/v1/cmdb/typeproperties', data, httpOptions);
  }

  public async createItem(typeId :number, data :any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };
    let ret :any = await this.http.post(this.settingsService.url + '/v1/cmdb/types/' + typeId + '/items', data, httpOptions).toPromise();
    return ret['id'];
  }

  public async getItems(typeId :number, params :any = []) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
      observe: 'response' as 'response',
    };
    for (let param of params) {
      httpOptions.params = httpOptions.params.set(param['key'], param['value'])
    }
    return await this.http.get(this.settingsService.url + '/v1/cmdb/types/' + typeId + '/items', httpOptions).toPromise();
  }

  public getItem(id :number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
    };

    return this.http.get(this.settingsService.url + '/v1/cmdb/items/' + id, httpOptions);
  }

  /**
   * 
   * @param type (next, last, first, prev)
   */
  public getPagination(type :string, link : string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.token
      }),
      params: new HttpParams(),
      observe: 'response' as 'response',
    };

    let links = link.split(', ');
    for (let linktype of links) {
      if (linktype.includes('rel="' + type + '"')) {
        // extract the url
        const matches = linktype.match(/<(.*)>; rel=/);
        if (matches !== null) {
          return this.http.get(matches[1], httpOptions);
        }
      }
    }
    return null;
  }

}
