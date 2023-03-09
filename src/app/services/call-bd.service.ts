import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Call } from '../model/Call';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { callbackify } from 'util';

@Injectable({
  providedIn: 'root'
})
export class CallBDService {
  callIn:Call;

  constructor(private readonly http: HttpClient) { }

  /**
   * 
   * @returns todas las llamadas de la base de datos
   */
  public getAllCalls():Observable<Call[]> {
    return this.http.get<Call[]>(`${environment.serverURL}/api/Call/GetAll`)
  }

  /**
   * Metodo para traer la llamada de la base de datos por una id
   * @param id de la llamada que queremos traer
   * @returns el observable de la llamda
   */
  public getCall(id:number):Observable<Call> {
    const url = `${environment.serverURL}/api/Call/get/${id}`;
    return this.http.get<Call>(url);
  }

  /**
   * Metodo para actualizar una llamada en la base de datos, actualizamos el estado y el id del usuario que se inicializa a null
   * @param id de la llamada que queremos actualizar
   * @param Call para actualizar
   * @returns la llamada ya actualizada
   */
  public updateCall(id:Number, Call:Call) : Observable<Call> {
    return this.http.put<Call>(`${environment.serverURL}/api/Call/Update/${id}`, Call);
  }
}
