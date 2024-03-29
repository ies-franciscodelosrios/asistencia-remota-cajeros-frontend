import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { environment } from 'src/environments/environment';
import { Call } from '../model/Call';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public data: Call[] = null;
  private _connected:boolean = false;
  private hubConnection: signalR.HubConnection
    public startConnection = () => {
      return new Promise((resolve,reject)=>{
        this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl(environment.SignalR)
                              .build();
      this.hubConnection
        .start()
        .then(() => {
          this._connected=true;
          console.log('Connection started');
          resolve(null);
        })
        .catch(err => reject('Error while starting connection: ' + err))
      })
      
    }
    
    public addTransferChartDataListener = async () :Promise<void> => {
       this.hubConnection.on('transferchartdata', (data) => {
       this.data = data;
      });
    }

    public get connected(){
      return this._connected;
    }

    public endConnection = async ()=>{
      try{
        await this.hubConnection.stop();
      }catch(err){
        console.error(err);
      }
    }
    //Desconexión
}
