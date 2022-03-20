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
import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ItemReorderEventDetail } from '@ionic/core';
import { IProperty } from 'src/app/interfaces/Property';
import { IListvalue } from 'src/app/interfaces/Listvalue';
import { filter } from 'rxjs';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { IItemCreate } from 'src/app/interfaces/ItemCreate';
import { IType } from 'src/app/interfaces/Type';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit {

  public typeId = 0;
  public name = '';
  public properties :any = [];
  public items: any = [];
  public numberElements :string = '';
  public filtersClass :any = {};
  public links :string = '';
  public searchText = '';
  public panelClass = 'ion-hide';
  public panelType = '';
  public itemsPerPage = '25';
  public currentPage = 1;
  public totalPages = 1;
  private propertiesOrder :any = [];
  private userparamsId = 0;
  private propertiesHidden :number[] = [];

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private globalVars: GlobalVarsService
    ) {

  }

  ngOnInit() {
    this.backend.initialized.subscribe((res :any) => {
      if (res === true) {
        let typeId = this.route.snapshot.paramMap.get('id');
        if (typeId !== null) {
          this.typeId = +typeId;
        }
        let name = this.route.snapshot.paramMap.get('name');
        if (name !== null) {
          this.name = name;
        }

        // Get userparams
        if (this.globalVars.userparams.itemlist !== null) {
          this.backend.getMyParams(this.globalVars.userparams.itemlist.id)
          .subscribe((res :any) => {
            for (let data of res.body) {
              this.userparamsId = data.id;
              for (let prop of data.properties) {
                if (prop.name === 'elements per page') {
                  this.itemsPerPage = prop.value.toString();
                } else if (prop.name === 'property ids list (string)') {
                  this.propertiesOrder = JSON.parse(prop.value);
                } else if (prop.name === 'property ids hidden list (string)') {
                  this.propertiesHidden = JSON.parse(prop.value);
                }
              }
            }
            this.getType();
            this.getItems([{key: 'per_page', value: this.itemsPerPage}]);
          });
        } else {
          this.getType();
          this.getItems([{key: 'per_page', value: this.itemsPerPage}]);
        }

        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(res => {
          this.getItems([{key: 'per_page', value: this.itemsPerPage}]);
        });        
      }
    });
  }

  public reloadItems() {
    this.getItems([{key: 'per_page', value: this.itemsPerPage}]);
  }


  public getListProperties() {
    return <any>this.properties.filter((prop :any) => prop.valuetype === "list");
  }

  public getItemPropertiesOrder(properties: IProperty[]) {
    properties.sort((a, b) => this.propertiesOrder.indexOf(a.id) - this.propertiesOrder.indexOf(b.id));
    let filteredProperties = properties.filter((k :IProperty) => this.propertiesHidden.indexOf(k.id) === -1);
// TODO not sure IPropety is the right HERE
    if (filteredProperties === undefined) {
      return [];
    }
    return filteredProperties;
  }

  public reverseFilterClass(propId :number) {
    if (this.filtersClass[propId] === 'hideContent') {
      this.filtersClass[propId] = 'showContent';
    } else if (this.filtersClass[propId] === 'showContent') {
      this.filtersClass[propId] = 'hideContent';
    }
  }

  public async loadLink(type :string) {
    this.backend.getPagination(type, this.links)
      ?.subscribe((res) => {
      if (res !== null) {
        this.parseGetItemsResponse(res);
      }
    })
  }

  public async search(evt: any) {
    let params = [];
    console.log(this.searchText);
    let groups = this.searchText.match(/(\w+:\w+)/g);
    if (groups !== null) {
      for (let group of groups) {
        if (group.includes(' in:')) {
          // Manage this case "test in:name"

        } else {
          console.log(group);
          let values = group.split(':');
          console.log(values);
          params.push({key: values[0], value: values[1]});
        }
      }
    }
    await this.getItems(params);
  }

  /**
   * This function is used to display a type of panel, or hide it
   *
   * @param type
   */
  public setPanelType(type: string) {
    if (this.panelType === '') {
      this.panelType = type;
      this.panelClass = '';
    } else if (this.panelType !== type) {
      this.panelType = type;
    } else {
      this.panelType = '';
      this.panelClass = 'ion-hide';
    }
  }

  public exportItems(fileFormat: string) {
    console.log(fileFormat);
  }

  public doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.properties = ev.detail.complete(this.properties);
    let propertiesOrder :any = [];
    for (let prop of this.properties) {
      propertiesOrder.push(prop.id);
    }
    this.propertiesOrder = propertiesOrder;
    this.items = [...this.items];
  }

  public navClass(page :string) {
    if (this.currentPage === 1 && page === 'first') {
      return 'navcurrent';
    }
    if (this.currentPage === this.totalPages && page === 'last') {
      return 'navcurrent';
    }
    return 'nav';
  }

  public displayPropertyValue(prop: IProperty): string {
    if (prop.valuetype === 'string') {
      return prop.value;
    } else if (prop.valuetype === 'list') {
      if (prop.value === '') {
        return '';
      }
      let val: IListvalue|undefined = prop.listvalues.find((listValue :IListvalue) => listValue.id === parseInt(prop.value));
      if (val !== undefined) {
        return val.value;
      }
    }
    return '';
  }

  public saveParameters() {
    if (this.globalVars.userparams.itemlist !== null) {
      if (this.userparamsId > 0) {
        this.backend.patchItemProperty(
          this.userparamsId, 
          this.globalVars.userparams.itemlist.properties.elementsPerPage, 
          this.itemsPerPage)
        .subscribe();
        this.backend.patchItemProperty(
          this.userparamsId, 
          this.globalVars.userparams.itemlist.properties.propertiesOrder, 
          JSON.stringify(this.propertiesOrder))
        .subscribe();
        this.backend.patchItemProperty(
          this.userparamsId, 
          this.globalVars.userparams.itemlist.properties.propertiesOrder, 
          JSON.stringify(this.propertiesHidden))
        .subscribe();
      } else {
        let data: IItemCreate = {
          name: 'my param',
          type_id: this.globalVars.userparams.itemlist.id,
          properties: [
            {
              property_id: this.globalVars.userparams.itemlist.properties.typeId,
              value: this.itemsPerPage
            },
            {
              property_id: this.globalVars.userparams.itemlist.properties.propertiesOrder,
              value: JSON.stringify(this.propertiesOrder)
            },
            {
              property_id: this.globalVars.userparams.itemlist.properties.propertieshidden,
              value: JSON.stringify(this.propertiesHidden)
            }
          ],
        };
        this.backend.createItem(data);
      }
    }
  }

  public toggleHideProperty(id :number) {
    if (this.propertiesHidden.indexOf(id) !== -1) {
      // find it, so delete id
      let filterProp = this.propertiesHidden.filter(k => k !== id);
      if (filterProp === undefined) {
        this.propertiesHidden = [];
      } else {
        this.propertiesHidden = filterProp;
      }
    } else {
      // not find it, so add it
      this.propertiesHidden.push(id);
    }
  }

  public getClassPropertyState(id :number) {
    if (this.propertiesHidden.indexOf(id) !== -1) {
      return 'disabled';
    }
    return 'activated';
  }

  public getPropertiesHeaders() {
    let properties = this.properties.filter((k :IProperty) => this.propertiesHidden.indexOf(k.id) === -1);
    if (properties === undefined) {
      return [];
    }
    return properties;
  }

  private parseGetItemsResponse(res: any)
  {
    let numberElements = res.headers.get('X-Total-Count');
    if (numberElements !== null) {
      this.numberElements = numberElements;
    }
    this.totalPages = Math.ceil(parseInt(this.numberElements) / parseInt(this.itemsPerPage));
    // Manage links
    let links = res.headers.get('Link');
    if (links !== null) {
      this.links = links;
    }
    // Manage Content-Range
    let contentRange = res.headers.get('Content-Range');
    const matches = contentRange.match(/items (\d+)-(\d+)\/(\d+)/);
    this.currentPage = Math.ceil(matches[1] / parseInt(this.itemsPerPage));

    this.items = res.body;
    this.items.sort((a :any, b :any) => (a.name > b.name) ? 1 : -1);
  }

  private getType() {
    this.backend.getType(this.typeId)
    .subscribe((res: IType) => {
      this.name = res['name'];
      for (let prop of res['properties']) {
        if (prop.valuetype === 'list') {
          this.filtersClass[prop.id] = '';
          if (prop.listvalues.length > 3) {
            this.filtersClass[prop.id] = 'hideContent';
          }
        }
        if (this.userparamsId === 0) {
          this.propertiesOrder.push(prop.id);
        }
      }
      console.log(res['properties']);
      if (this.userparamsId > 0) {
        // reorder the properties
        const mapOrder = (order: any, key: any) => (a:any, b:any) => order.indexOf(a[key]) > order.indexOf(b[key]) ? 1 : -1;
        res['properties'].sort(mapOrder(this.propertiesOrder, 'id'));
      }
      this.properties = res['properties'];
    });
  }

  private async getItems(params :object[]) {
    let res = await this.backend.getItems(this.typeId, params);
    if (res !== undefined) {
      this.parseGetItemsResponse(res);
    }
  }

}
