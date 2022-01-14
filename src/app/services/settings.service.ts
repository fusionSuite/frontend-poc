import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public url = 'http://127.0.0.1';

  constructor(private http: HttpClient) {
  }

  private getJSON(): Observable<any> {
    return this.http.get("./config.json");
  }

  public async getSetting(){
    await this.getJSON()
    .pipe(map((res :any) => {
      this.url = res['backendUrl'];
    }))
    .toPromise();    
    // .subscribe((config) => {
    //   this.url = config.backendUrl;
    // });
  }
}
