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
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-itemdetail',
  templateUrl: './itemdetail.component.html',
  styleUrls: ['./itemdetail.component.scss'],
})
export class ItemdetailComponent implements OnInit {

  public id = 0;
  public typeId = 0;
  public name = '';
  public type: any = {propertygroups: []};
  public checkoutForm: FormGroup;
  public formLoaded = false;
  public properties :any = {};

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    ) {
      this.checkoutForm = new FormGroup({});
  }

  ngOnInit() {
    this.backend.initialized.subscribe((res :any) => {
      if (res === true) {
        let id = this.route.snapshot.paramMap.get('detailId');
        if (id !== null) {
          this.id = +id;
        }
        let typeId = this.route.snapshot.paramMap.get('id');
        if (typeId !== null) {
          this.typeId = +typeId;
        }
        this.backend.getType(this.typeId)
        .subscribe((res :any) => {
          this.type = res;
          for (let property of res['properties']) {
            this.properties[property.id] = property;
          }
          // Create formGroup
          this.createFormGroup(res);
          console.log(res);
        });
        if (this.id > 0) {

        }
      }
    });
  }

  private createFormGroup(type :any) {
    let data = <any>{};
    data['name'] = new FormControl('', Validators.required);
    for (let property of type['properties']) {
      data[property['id']] = new FormControl(''); // Validators.required
    }
    this.checkoutForm = new FormGroup(data);
    this.formLoaded = true;
  }

  public onSubmit() {
    let data = {
      name: this.checkoutForm.value.name,
      properties: <any>[],
    };
    for (let property of this.type['properties']) {
      data.properties.push({
        property_id: property.id,
        value: this.checkoutForm.value[property.id]
      });
    }
    if (this.id > 0) {
      // this.backend.updateItem

    } else {
      let id = this.backend.createItem(this.typeId, data);
    }   
  }
}
