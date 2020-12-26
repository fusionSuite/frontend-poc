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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypePageRoutingModule } from './type-routing.module';

import { TypePage } from './type.page';
import { TypedetailComponent } from './typedetail/typedetail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TypePage,
    TypedetailComponent,
  ]
})
export class TypePageModule {}
