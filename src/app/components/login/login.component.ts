import { Component, OnInit, ViewChild } from '@angular/core';
import {Router} from "@angular/router";
import { UserService } from 'src/app/services/user.service';
import { SHA256 } from 'crypto-js';
import { User } from 'src/app/model/User';
import { LocalStorageService } from 'src/app/services/local-storage.service';

declare var bootstrap: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userLogin: string = 'Sergio';
  passLogin: string = '1234';
  userSign: string = '';
  passSign: string = '';
  passRepeat: string = '';

  constructor(private router:Router,private readonly http: UserService, private local:LocalStorageService) { }

  async ngOnInit() {
  }
  
  /**
   * Metodo para logearte, modal para mostrar que el login es incorrecto
   * Controla en la base de datos si el usuario existe, si existe te accede al menu principal
   * Guardamos el usuario en localStorage para luego poder usar su id
   */
  async click() {
    try {
      const result = await this.http.getUser(this.userLogin,this.convertTextLogin()).toPromise();
      if(result != null) {
        const {password,...newresult} = result;
          this.local.create(newresult);
          this.router.navigate(['/main-menu']);
      } else {
        const toastLiveExample = document.getElementById('liveToast')
        const toast = new bootstrap.Toast(toastLiveExample)
        toast.show()
      }
    } catch {
      const toastLiveExample = document.getElementById('liveToast2')
      const toast = new bootstrap.Toast(toastLiveExample)
      toast.show()
    }
    }

  /**
   * Metodo para registrarse, creamos un usuario y lo guardamos en la base de datos
   * Modales para controlar la creación de usuarios
   */
  async SignUp() {
    const user: User = {
      username: this.userSign,
      password: this.convertTextSign()
    };
    
    try {
      if(user != null && this.passSign == this.passRepeat) {
        await this.http.postUser(user).toPromise();
        const toastLiveExample = document.getElementById('liveToast3')
        const toast = new bootstrap.Toast(toastLiveExample)
        toast.show()
        this.userSign = '';
        this.passSign = '';
        this.passRepeat = '';
      } else {
        const toastLiveExample = document.getElementById('liveToast4')
        const toast = new bootstrap.Toast(toastLiveExample)
        toast.show();
      }
    } catch {
      const toastLiveExample = document.getElementById('liveToast2')
      const toast = new bootstrap.Toast(toastLiveExample)
      toast.show();
    }
  }

  /**
   * 
   * @returns la contraseña encriptada para la creación del usuario
   */
  convertTextSign(): string {
    return SHA256(this.passSign).toString();
  }

  /**
   * 
   * @returns la contraseña encriptada para ver si el usuario existe en la base de datos
   */
  convertTextLogin(): string {
    return SHA256(this.passLogin).toString();
  }
}
