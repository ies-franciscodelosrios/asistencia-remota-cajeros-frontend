import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Metodo para traer todos los usuarios de la base de datos
   * @returns todos los usuarios de la base de datos
   */
  public getAllUsers(): Observable<User[]> {
    console.log('getAllUsers');
    return this.http.get<User[]>(`${environment.serverURL}/api/User/GetAll`);
  }

  /**
   * Metodo que manda una peticion post para crear un usuario y guardarlo en la base de datos
   * @param user que queremos guardar en la base de datos
   * @returns el usuario creado
   */
  public postUser(user : User): Observable<any> {
    let data:User ={
      id:user.id,
      username:user.username,
      password:user.password
    }
    return this.http.post<any>(`${environment.serverURL}/api/User`, data, {
      headers: { "Access-Control-Allow-Headers": "*", // this will allow all CORS requests
      "Access-Control-Allow-Methods": 'OPTIONS,POST,GET', // this states the allowed methods
      "Content-Type": "application/json" }
    });
  }

  /**
   * Metodo para comprobar que ese usuario existe en la base de datos y darnos acceso al menu principal
   * @param username del usuario que queremos comprobar
   * @param password del usuario que queremos comprobar
   * @returns el usuario en caso de encontrarlo para poder acceder
   */
  public getUser(username: string, password:string): Observable<User> {
    const url = `${environment.serverURL}/api/User/get/${username}/${password}`;
    return this.http.get<User>(url);
  }
}

