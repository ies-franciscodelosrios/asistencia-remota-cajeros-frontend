import { Component, OnInit, ViewChild } from '@angular/core';
import * as RFB from '@novnc/novnc/core/rfb';

@Component({
  selector: 'app-remote',
  templateUrl: './remote.html',
  styleUrls: ['./remote.css']
})
export class RemoteComponent implements OnInit {
  @ViewChild('windowVNC') window;
  private vnc:any
  private port = "26901";
  private target;
  private path = "";
  public connected = false;
  private url:any;

  ngOnInit(): void {

  }

  /**
   * Metodo para conectarse a la maquina en remoto
   * @param ip del servidor que queremos conectarnos
   * @param username del servidor (suele ser en blanco)
   * @param password del servidor
   */
  public connect(ip,username,password){
    if (window.location.protocol === "https:") {
      this.url = "wss";
    } else {
      this.url = "ws";
    }

    this.url += "://" + ip;
    if (this.port) {
      this.url += ":" + this.port;
    }
    this.url += "/" + this.path;

    console.log("URL: ", this.url);
    this.target=this.window.nativeElement;

    this.vnc = new RFB.default(this.target, this.url, {
      credentials: { password: password,username: username,target:this.target },
    });
  }

  /**
   * Metodo para desconectarnos del remoto
   */
  public disconnect(){
    this.vnc.disconnect();
  }

}
