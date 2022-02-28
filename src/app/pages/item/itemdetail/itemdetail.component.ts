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
import {forkJoin, of} from 'rxjs';
import { IItem } from 'src/app/interfaces/Item';
import { IType } from 'src/app/interfaces/Type';
import { IProperty } from 'src/app/interfaces/Property';
import { IItemCreate } from 'src/app/interfaces/ItemCreate';
import { IItemCreateProperty } from 'src/app/interfaces/ItemCreateProperty';
import { IListvalue } from 'src/app/interfaces/Listvalue';

@Component({
  selector: 'app-itemdetail',
  templateUrl: './itemdetail.component.html',
  styleUrls: ['./itemdetail.component.scss'],
})
export class ItemdetailComponent implements OnInit {

  public id = 0;
  public typeId = 0;
  public item: IItem = {
    id: 0,
    name: '',
    created_at: '',
    updated_at: '',
    properties: [],
    propertygroups: []
  };
  public type: IType = {
    id: 0,
    name: '',
    internamename: '',
    modeling: '',
    created_at: '',
    updated_at: '',
    properties: [],
    propertygroups: [],
  };
  public checkoutForm: FormGroup;
  public formLoaded = false;
  public properties :any = {};
  public canSave = false;
  public saving = false;
  public saved = false;
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
        if (this.id > 0) {

          forkJoin({
            item: this.backend.getItem(this.id),
            type: this.backend.getType(this.typeId)
          })
          .subscribe(({item, type}) => {
            this.item = item;
            this.type = type;
            for (let property of item.properties) {
              this.properties[property.id] = property;
            }
            this.createFormGroup();
          });
        } else {
          this.backend.getType(this.typeId)
          .subscribe((res: any) => {
            this.type = res;
            if (this.id === 0) {
              // Create formGroup from type only
              this.createFormGroupFromType(res);
            }
          });
        }
      }
    });
  }

  public onSubmit() {
    this.saving = true;
    this.canSave = false;
    if (this.id > 0) {
      let queries: any = {};
      if (this.item.name !== this.checkoutForm.value.name) {
        queries.item = this.backend.patchItem(this.id, this.checkoutForm.value.name);
      }
      for (let property of this.item.properties) {
        if (property.value !== this.checkoutForm.value[property.id]) {
          queries['prop' + property.id] = this.backend.patchItemProperty(this.id, property.id, this.checkoutForm.value[property.id]);
        }
      }
      if (queries.length === 0) {
        // no modifications
        return;
      }
      forkJoin(queries)
      .subscribe((res) => {
        console.log(res);
        this.saving = false;
        this.saved = true;
      });
    } else {
      let data: IItemCreate = {
        name: this.checkoutForm.value.name,
        type_id: this.typeId,
        properties: [],
      };
      for (let property of this.type.properties) {
        data.properties.push({
          property_id: property.id,
          value: this.checkoutForm.value[property.id]
        });
      }
      let id = this.backend.createItem(this.typeId, data);
      this.saving = false;
      this.saved = true;
    }
  }

  public getPropertyOfTypeById(id: number) {
    let property =  this.type.properties.find(element => element.id === id);
    if (property === undefined) {
      return {
        name: ''
      };
    }
    return property;
  }

  public getPropertiesOfPropertygroup(ids: Number[]) {
    let properties: IProperty[] = [];
    for (let id of ids) {
      let property =  this.type.properties.find(element => element.id === id);
      if (property !== undefined) {
        properties.push(property);
      }
    }
    return properties;
  }

  compareWith(o1: number, o2: number) {
    return o1 && o2 ? o1 === o2 : false;
  }

  /**
   * Used only when create a new item
   */
  private createFormGroupFromType(type :any) {
    let data = <any>{};
    data['name'] = new FormControl('', Validators.required);
    for (let property of type.properties) {
      data[property.id] = new FormControl(property.default); // Validators.required
    }
    this.checkoutForm = new FormGroup(data);
    this.checkoutForm.valueChanges.subscribe( () => {
      this.saved = false;
      this.canSave = true;
    });
    this.formLoaded = true;
  }

  /**
   * Used when update item.
   * So this.item and this.type has been got on the backend
   */
  private createFormGroup() {
    let data = <any>{};
    data['name'] = new FormControl(this.item.name, Validators.required);
    for (let property of this.item.properties) {
      data[property.id] = new FormControl(property.value);
    }
    this.checkoutForm = new FormGroup(data);
    this.checkoutForm.valueChanges.subscribe( () => {
      this.saved = false;
      this.canSave = true;
    });
    this.formLoaded = true;
  }

}
