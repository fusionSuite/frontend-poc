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
import { Component, OnInit, Input } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-typedetail',
  templateUrl: './typedetail.component.html',
  styleUrls: ['./typedetail.component.scss'],
})
export class TypedetailComponent implements OnInit {

  public id = 0;
  public name = '';
  public checkoutForm: FormGroup;
  public typeProperties: any = [];
  public propertiesGroupsList :any = [];
  public templateFile: any;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public router: Router,
  ) {
    this.checkoutForm = new FormGroup({
      name: new FormControl('', Validators.required),
      properties: new FormArray([])
    });
  }

  ngOnInit() {
    this.backend.initialized.subscribe((res :any) => {
      if (res === true) {
        let id = this.route.snapshot.paramMap.get('id');
        if (id === null) {
          this.id = 0;
        } else {
          this.id = +id;
        }
        if (this.id > 0) {
          this.backend.getType(this.id)
            .subscribe((res :any) => {
              this.checkoutForm.get('name')?.setValue(res['name']);
              this.name = res['name'];
              let position = 0;
              for (let propertygroup of res['propertygroups']) {
                let properties = this.checkoutForm.get('properties') as FormArray;
                properties.push(new FormControl(propertygroup['name']));
                this.propertiesGroupsList.push({
                  _internalPosition: (properties.length - 1),
                  _internalType: 'group',
                  name: propertygroup['name']
                });
                for (let propId of propertygroup.properties) {
                  let name = '';
                  for (let prop of res['properties']) {
                    if (prop.id === propId) {
                      name = prop.name;
                      continue;
                    }
                  }
                  let property = this.checkoutForm.get('properties') as FormArray;
                  property.push(new FormControl(propId));
                  this.propertiesGroupsList.push({
                    _internalPosition: (property.length - 1),
                    _internalType: 'property',
                    id: propId,
                    name
                  });
                }
              }
            });
        } else {
          // new item, create a new group and new property by default
          this.addGroup();
          this.addProperty();
        }
        this.backend.getTypeProperties()
          .subscribe((res) => {
            this.typeProperties = res;
            this.typeProperties.sort((a :any, b :any) => (a.name > b.name) ? 1 : -1);
          });
      }
    });
  }

  public addGroup() {
    let properties = this.checkoutForm.get('properties') as FormArray;
    let name = 'Main';
    if (properties.length > 0) {
      name = 'group' + properties.length;
    }
    properties.push(new FormControl(name));
    this.propertiesGroupsList.push({
      _internalPosition: (properties.length - 1),
      _internalType: 'group',
      name: name
    });
  }

  public addProperty() {
    let properties = this.checkoutForm.get('properties') as FormArray;
    properties.push(new FormControl(''));
    this.propertiesGroupsList.push({
      _internalPosition: (properties.length - 1),
      _internalType: 'property',
      id: 0
    });
  }


  public loadFileFromDevice(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.templateFile = reader.result;
      // console.log(JSON.parse(JSON.stringify(reader.result)));
      // get the blob of the image:
      // let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
    };
    reader.onerror = (error) => {
      //handle errors
    };
  }

  public onSubmit() {
    let groups = [];
    let propertiesOfGroup = [];
    let currentGroup :any = {};
    for (let item of this.propertiesGroupsList) {
      if (item._internalType === 'group') {
        if (currentGroup['name'] !== undefined) {
          currentGroup['properties'] = propertiesOfGroup;
          groups.push(currentGroup);
          currentGroup = {};
          propertiesOfGroup = [];
        }
        item.name = this.checkoutForm.value.properties[item._internalPosition];
        currentGroup = item;
      } else {
        if (item.name === undefined) {
          propertiesOfGroup.push(this.checkoutForm.value.properties[item._internalPosition]);
        } else {
          propertiesOfGroup.push(item.id);
        }
      }
    }
    if (currentGroup['name'] !== undefined) {
      currentGroup['properties'] = propertiesOfGroup;
      groups.push(currentGroup);
    }
    if (this.id > 0) {

    } else {
      let id = this.backend.createType(this.checkoutForm.value.name, groups);
    }
  }

  public async createTemplate() {
    const json = JSON.parse(this.templateFile);
    let redirectId = 0;
    let groups = [];
    let currentGroup = {name: "", properties: <any>[]};
    for (let type of json) {
      for (let group of type['propertygroups']) {
        currentGroup = {
          name: group.name,
          properties: []
        };
        for (let property of group['properties']) {
          let propertyFound :any[] = this.typeProperties.filter((prop :any) => prop.name.toLowerCase() === property.name.toLowerCase());
          if (propertyFound.length > 0) {
            currentGroup.properties.push(propertyFound[0].id);
          } else {
            // TODO create a new typeProperty
            const ret :any = await this.backend.createTypeProperty(property).toPromise();
            currentGroup.properties.push(ret['id']);
          }
        }
        if (currentGroup.properties.length > 0) {
          groups.push(currentGroup);
        }
      }
      const retType = await this.backend.createType(type['itemName'], groups);
      // if (retType !== undefined) {
      //   redirectId = +retType;
      // }
    }

    this.router.navigate(['/type/' + redirectId]);
  }

  public reorderItems(event :any)
  {
    console.log(event);
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);
    const itemMove = this.propertiesGroupsList.splice(event.detail.from, 1)[0];
    this.propertiesGroupsList.splice(event.detail.to, 0, itemMove);
    event.detail.complete();
  }
}
