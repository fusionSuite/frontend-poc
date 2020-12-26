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
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
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
        this.backend.getType(this.typeId)
        .subscribe((res: any) => {
          this.name = res['name'];
          for (let prop of res['properties']) {
            if (prop.valuetype === 'list') {
              this.filtersClass[prop.id] = '';
              if (prop.listvalues.length > 3) {
                this.filtersClass[prop.id] = 'hideContent';
              }
            }
          }
          this.properties = res['properties'];
        });
        this.getItems([]);
      }
    });
  }

  private async getItems(params :object[]) {
    let res = await this.backend.getItems(this.typeId, params);
    if (res !== undefined) {
      let numberElements = res.headers.get('X-Total-Count');
      if (numberElements !== null) {
        this.numberElements = numberElements;
      }
      let links = res.headers.get('Link');
      if (links !== null) {
        this.links = links;
      }
      this.items = res.body;
      this.items.sort((a :any, b :any) => (a.name > b.name) ? 1 : -1);
    }
  }

  public getListProperties() {
    return <any>this.properties.filter((prop :any) => prop.valuetype === "list");
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
        let numberElements = res.headers.get('X-Total-Count');
        if (numberElements !== null) {
          this.numberElements = numberElements;
        }
        let links = res.headers.get('Link');
        if (links !== null) {
          this.links = links;
        }
        this.items = res.body;
        this.items.sort((a :any, b :any) => (a.name > b.name) ? 1 : -1);
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

}
