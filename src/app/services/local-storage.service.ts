import { Injectable } from '@angular/core';
import { Call } from '../model/Call';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private storageKey = 'LocalStorageItems';

  constructor() { }

  /**
   * Metodo para traer un usuario del localStorage
   * @returns el usuario del localStorage que queremos traernos
   */
  getUser() {
    const items = localStorage.getItem(this.storageKey);
    return JSON.parse(items);
  }

  /**
   * Metodo para guardar un usuario
   * @param user que queremos guardar en localStorage
   */
  create(user: any) {
    const userJSON = JSON.stringify(user);
    localStorage.setItem(this.storageKey, userJSON);
  }

  /**
   * Metodo para eliminar un usuario del localStorage
   * @param id del usuario que queremos eliminar
   */
  delete(id: any) {
    const items = this.getUser();
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }
}
