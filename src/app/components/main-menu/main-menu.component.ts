import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { CallService } from 'src/app/services/call.service';
import { RemoteComponent } from '../remote/remote';
import { Call } from 'src/app/model/Call';
import { CallBDService } from 'src/app/services/call-bd.service';
import { UserService } from 'src/app/services/user.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CajeroService } from 'src/app/services/cajero.service';
import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y/input-modality/input-modality-detector';

declare var bootstrap: any;

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  public isCallStarted$: Observable<boolean>;
  public Call:Call[];
  showCall:boolean = false;
  showButton:boolean = false;
  showLocalVideo:boolean = false;
  callButton:boolean = false;
  id:number = null;
  private tooltipList = new Array<any>();

  @ViewChild('localVideo')
  localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo')
  remoteVideo!: ElementRef<HTMLVideoElement>;

  @ViewChild('remoteVideoContainer') container!: ElementRef<HTMLDivElement>;
  
  @ViewChild(RemoteComponent) videocall:RemoteComponent;
  @ViewChild('mySpan') mySpan: HTMLSpanElement;

  constructor(public dialog: MatDialog, private callService: CallService, private readonly http:CallBDService, private readonly http2:UserService, public signal:SignalrService,
    private local:LocalStorageService, public cajeroService : CajeroService) { 
    this.isCallStarted$ = this.callService.isCallStarted$;
  }

  /**
   * Metodo para cuando salgamos del menu principal, eliminar y destruir el peer
   */
  ngOnDestroy(): void {
    this.callService.destroyPeer();
  }

  /**
   * Metodo que se inicializa con el componente, inicia el peer y el socket para la transferencia de datos
   * Obtiene los permisos para la camara y el audio
   */
  async ngOnInit(): Promise<void> {
    //const spinner = document.getElementById('spinner');
    //spinner.style.display = 'block';
    try{
      this.callService.initPeer();
      await this.signal.startConnection();  //conexión
      this.signal.addTransferChartDataListener();
    }catch(err){
      console.error(err);
    }

    this.callService.localStream$
      .pipe(filter(res => !!res))
      .subscribe((stream: MediaProvider | null) =>{
        this.localVideo.nativeElement.srcObject = stream;
      }) 
    this.callService.remoteStream$
      .pipe(filter(res => !!res))
      .subscribe((stream: MediaProvider | null) => {
        this.remoteVideo.nativeElement.srcObject = stream;

    })
  }

  /**
   * Metodo para conectarnos en remoto, obtenemos el cajero pasandole la ID
   * Y nos conectamos a la máquina mediante el metodo del servicio
   */
  public vnc(){
    /*
    this.cajeroService.getCashier(this.http.callIn.cajeroId).subscribe(
      cajero => {
        console.log(cajero);
        this.videocall.connect(cajero.ip,cajero.username,cajero.password);
      },
      error => {
        console.log(error);
      }
    );
    */
   this.videocall.connect('172.16.16.131','','headless');
  }

  /**
   * Metodo para cerrar la conexion remota
   */
  public closevnc(){
    this.videocall.disconnect();
  }

  /**
   * Metodo para terminar llamada, donde actualizamos el estado de la llamada a 2, que seria
   * cuando ha terminado la llamada
   * Destruimos el peer y creamos uno nuevo para la siguiente conexion peer to peer
   */
  public endCall() {
    this.callService.destroyPeer();
    this.callService.initPeer();
    this.callButton = false;
    this.showButton = false;
    this.showCall = false;
    this.showLocalVideo = false;
    this.http.callIn.estado = 2;
    this.http.updateCall(this.http.callIn.id,this.http.callIn).subscribe(
      data => {
        console.log("EXITO")
      },
      error => {
        console.log(error)
      }
    );
    this.remoteVideo.nativeElement.srcObject=undefined;
  }

  /**
   * Metodo para conectarnos a la llamada, updatea la llamada con el estado a 1, que seria en llamada
   * y tambien con el id del usuario que atiende la llamada
   * @param Call llamada que queremos updatear y guardar para el posterior uso
   */
  public update(Call:Call) {
    this.callButton = true;
    this.showLocalVideo = true;
    this.showButton = true;
    const user = this.local.getUser();
    Call.estado = 1;
    Call.userId = user.id;
    this.http.updateCall(Call.id, Call).subscribe(
      data => {
        console.log("EXITO")
      },
      error => {
        console.log(error)
      }
    );
    this.showCall = true;
    this.id = Call.cajeroId;
    this.callService.establishMediaCall(Call.p2p,()=>{
      this.endCall();
    });
    this.http.callIn = Call;
    this.CloseAccordion("collapseOne2");
  }

  /**
   * Metodo para cerrar el accordion cuando pulsamos un boton
   * @param id del accordion que queremos cerrar
   */
  public CloseAccordion(id:string) {
    var myCollapse = document.getElementById(id);
    var bsCollapse = new bootstrap.Collapse(myCollapse, {
    show: false
  });
  }

  /**
   * Metodo para abrir el accordion cuando pulsemos un boton
   * @param id del accordion que queremos abrir
   */
  public ExpandAccordion(id:string) {
    var myCollapse = document.getElementById(id);
    var bsCollapse = new bootstrap.Collapse(myCollapse, {
    show: true
  });
  }
}
