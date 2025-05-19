import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FacadeService } from './facade.service';


@Injectable({
  providedIn: 'root'
})
export class ScanService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) {}

  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(Preferences.get({ key: 'token' })).pipe(
      switchMap(result => {
        const token = result.value;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return from([headers]);
      })
    );
  }

  public getScans(page: number = 1): Observable<any> {
    var token = this.facadeService.getSessionToken();
    var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/food/all`, {headers:headers});

  }

  public getScanByID(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    // La vista espera GET /food/view?id=ID
    return this.http.get<any>(`${environment.url_api}/food?id=${id}`, { headers });
  }
}

