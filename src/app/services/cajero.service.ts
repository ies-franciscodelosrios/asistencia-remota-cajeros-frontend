import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cajero } from '../model/Cajero';

@Injectable({
  providedIn: 'root'
})
export class CajeroService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Metodo para traer el cajero pasandole una id
   * @param id del cajero que queremos traer
   * @returns observable de tipo cajero
   */
  public getCashier(id:number):Observable<Cajero> {
    const url = `${environment.serverURL}/api/Cajero/get/${id}`;
    return this.http.get<Cajero>(url);
  }
}
