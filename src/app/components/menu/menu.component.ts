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
import { NavigationEnd, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import {filter} from 'rxjs/operators';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  public currentMenu = '';

  constructor(
    private menu: MenuController,
    public globalVars: GlobalVarsService,
    private router: Router
    ) {

  }

  ngOnInit() {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((res :any) => {
        for (let item of this.globalVars.types) {
          if (res['url'] === '/items/'+item['id']+'/'+item['name'].replace(' ', '-')) {
            this.currentMenu = item['name'];
          }
        }
        if (res['url'] === '/home' && res['id'] > 1) {

        }
      });      

    // this.menu.enable(true, 'FusionMenu');
    // this.menu.open('FusionMenu');
  }

  public getTypes() {
    return this.globalVars.types.filter((type :any) => type.id > 0);
  }

  public getCreateType() {
    return this.globalVars.types.filter((type :any) => type.id === 0);
  }
}
