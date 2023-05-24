import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Call } from '../model/Call';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { callbackify } from 'util';
import { NonNullableFormBuilder } from '@angular/forms';

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

    /**
   * 
   * @returns todas las llamadas de la base de datos que haya atendido un usuario en concreto
   * @param id del usuario que queremos saber sus llamadas
   */
     public getAllCallsByUser(idUser:Number):Observable<Call[]> {
      return this.http.get<Call[]>(`${environment.serverURL}/api/Call/GetAllByUser/${idUser}`);
    }

    /**
     * Metodo que devuelve el numero de cola que se encuentra la llamada que se acaba de hacer
     * @param idCall de la llamada en proceso que queremos saber el numero de cola en el que estamos
     * @returns el numero de cola que nos encontramos
     */
    public GetQueueNumber(idCall:Number) : Observable<Number> {
      return this.http.get<Number>(`${environment.serverURL}/api/Call/QueueNumber/${idCall}`);
    }

    /**
     * Metodo que devuelve el tiempo estimado de espera de la llamada para ser atendida
     * @returns el numero estimado de tiempo que tenemos que esperar para que nuestra llamada sea atendida
     */
    public GetDurationEstimated() : Observable<number> {
      return this.http.get<number>(`${environment.serverURL}/api/Call/DurationEstimated`);
    }

    /**
     * Metodo que actualiza el rating de la llamada que acabamos de terminar
     * @param id de la llamada que vamos a actualizar con el rating que el usuario proporcione
     * @param Call llamada que hemos terminado y vamos a darle un rating
     * @param idUser del usuario del que setearemos el nuevo rating de la llamada y haremos una media
     */
    public UpdateRating(id:Number, Call:Call, idUser:Number) {
      const url = `${environment.serverURL}/api/Call/UpdateRating/${id}`;
      this.http.put(url, Call, { params: { idUser: idUser.toString() } }).subscribe(
        () => {
          console.log('Datos actualizados correctamente');
        },
        (error) => {
          console.error('Error al actualizar los datos', error);
        }
      );
    }
}
