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
  selector: 'app-itemview',
  templateUrl: './itemview.component.html',
  styleUrls: ['./itemview.component.scss'],
})
export class ItemviewComponent implements OnInit {

  public id = 0;
  public name = '';
  public item: any;
  public loaded = false;
  
  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    ) {
  }

  ngOnInit() {
    this.backend.initialized.subscribe((res :any) => {
      if (res === true) {
        let id = this.route.snapshot.paramMap.get('itemId');
        if (id !== null) {
          this.id = +id;
        }
        this.getItem(this.id);
      }
    });
  }

  private getItem(id :number) {
    this.backend.getItem(id)
      .subscribe((res :any) => {
        this.name = res['name'];
        this.item = res;
        this.loaded = true;
        console.log(res);
      });
  }

  public filterProperties(groupProperties :any, onlyText :boolean) {
    if (onlyText) {
      return this.item.properties.filter((prop :any) => prop.valuetype === 'text' && groupProperties.includes(prop.id));
    }
    return this.item.properties.filter((prop :any) => prop.valuetype !== 'text' && groupProperties.includes(prop.id));
  }
}
