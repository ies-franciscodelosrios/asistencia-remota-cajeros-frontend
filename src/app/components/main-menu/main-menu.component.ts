import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subject } from 'rxjs';
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
import { interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Cajero } from 'src/app/model/Cajero';

declare var bootstrap: any;

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  public isCallStarted$: Observable<boolean>;
  public Call:Call[];
  public CallHistory:Call[];
  showCall:boolean = false;
  showButton:boolean = false;
  showLocalVideo:boolean = false;
  noHistory:boolean = false;
  callButton:boolean = false;
  history:boolean = true;
  closeHistory:boolean = false;
  showHistory:boolean = true;
  id:number = null;
  note:number = 0;
  Username:string = null;
  cajeroInfoId:number = null;
  ratingInfo:number = null;
  fechaInfo:string = null;
  durationInfo:string = null
  nombreInfo:string = null;
  ipInfo:string = null;
  private tooltipList = new Array<any>();
  callStartTime: number;
  callDuration: number;
  private timer$ = interval(1000);
  private destroy$ = new Subject();
  itemsPerPage = 4; // Número de elementos por página
  currentPage = 1; // Página actual
  displayedItems: any[] = [];

  @ViewChild('localVideo')
  localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo')
  remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideoContainer') container!: ElementRef<HTMLDivElement>;
  @ViewChild(RemoteComponent) videocall:RemoteComponent;
  @ViewChild('mySpan') mySpan: HTMLSpanElement;

  constructor(public dialog: MatDialog, private callService: CallService, private readonly http:CallBDService, private readonly http2:UserService, public signal:SignalrService,
    private local:LocalStorageService, public cajeroService : CajeroService, private router:Router, private datePipe: DatePipe) { 
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
    this.note = this.local.getUser().note;
    this.Username = this.local.getUser().username;
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
    try {
      this.cajeroService.getCashier(this.http.callIn.cajeroId).subscribe(
        cajero => {
          this.videocall.connect(cajero.ip,cajero.username,cajero.password);
        },
        error => {
          console.log(error);
        }
      );
    } catch(err) {
      const windowToast = document.getElementById('liveToast3');
      const toast = new bootstrap.Toast(windowToast);
      toast.show()
      console.error(err);
    }
  }

  /**
   * Metodo para cerrar la conexion remota
   */
  public closevnc(){
    try {
      this.videocall.disconnect();
    } catch(err) {
      const windowToast = document.getElementById('liveToast4');
      const toast = new bootstrap.Toast(windowToast);
      toast.show()
      console.error(err);
    }
  }

  /**
   * Metodo para terminar llamada, donde actualizamos el estado de la llamada a 2, que seria
   * cuando ha terminado la llamada
   * Destruimos el peer y creamos uno nuevo para la siguiente conexion peer to peer
   */
  public endCall() {
    try {
      this.callService.destroyPeer();
      this.callService.initPeer();
      this.destroy$.next();
      this.destroy$.complete();
      this.callButton = false;
      this.showButton = false;
      this.showCall = false;
      this.showLocalVideo = false;
      this.http.callIn.estado = 2;
      this.http.callIn.duration = this.callDuration;
      this.http.updateCall(this.http.callIn.id,this.http.callIn).subscribe(
        data => {
          console.log("EXITO")
        },
        error => {
          console.log(error)
        }
      );
      this.remoteVideo.nativeElement.srcObject=undefined;
      const windowToast = document.getElementById('liveToast5');
      const toast = new bootstrap.Toast(windowToast);
      toast.show()
    } catch(err) {
      const windowToast = document.getElementById('liveToast6');
      const toast = new bootstrap.Toast(windowToast);
      toast.show();
      console.log(err);
    }
  }

  /**
   * Metodo para conectarnos a la llamada, updatea la llamada con el estado a 1, que seria en llamada
   * y tambien con el id del usuario que atiende la llamada
   * @param Call llamada que queremos updatear y guardar para el posterior uso
   */
  public update(Call:Call) {
    try {
      this.callButton = true;
      this.showLocalVideo = true;
      this.showButton = true;
      const user = this.local.getUser();
      Call.estado = 1;
      Call.userId = user.id;
      this.callStartTime = Date.now();
      this.timer$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const seconds = Math.floor((Date.now() - this.callStartTime) / 1000);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          this.callDuration = parseFloat(`${minutes}.${remainingSeconds}`);
        });
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
    } catch (err) {
      const windowToast = document.getElementById('liveToast7');
      const toast = new bootstrap.Toast(windowToast);
      toast.show();
      console.log(err);
    }

  }

  /**
   * Método para cerrar sesión que elimina el usuario del Local Storage y navega
   * hacia el Login
   */
  public logout() {
    try {
      const user = this.local.getUser();
      this.local.delete(user.id);
      this.router.navigate(['/login']);
      const windowToast = document.getElementById('liveToast8');
      const toast = new bootstrap.Toast(windowToast);
      toast.show();
    } catch(err) {
      const windowToast = document.getElementById('liveToast9');
      const toast = new bootstrap.Toast(windowToast);
      toast.show();
      console.log(err);
    }
  }

  /**
   * Método para ver el historial de llamadas atendidas por ese usuario junto a su rating
   */
  public historyButton() {
    try {
      const user = this.local.getUser();
      this.history = false;
      this.closeHistory = true;
      this.showHistory = false;
      this.http.getAllCallsByUser(user.id).subscribe(
        data => {
          this.CallHistory = data.map(item => {
            const fechaFormateada = this.datePipe.transform(item.date, 'dd/MM/yyyy');
            item.formatted = fechaFormateada
            return item;
          });
        if (data.length == 0) {
          this.noHistory = true;
        } else {
          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;
          this.displayedItems = this.CallHistory.slice(startIndex, endIndex);
        }
        },
        error => {
          console.log(error);
        }
      );
    } catch(err) {
      console.log(err);
    }
  }

  /**
   * Metodo que divide la lista completa para hacer la paginación y mostrar la lista de 4 en 4
   */
  updateDisplayedItems() {
    try {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedItems = this.CallHistory.slice(startIndex, endIndex);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * 
   * @returns las páginas para mostrarlas en la paginación
   */
  getPages(): number[] {
    try {
      const totalPages = this.getTotalPages();
      return Array(totalPages).fill(0).map((_, index) => index + 1);
    } catch (err) {
      return err;
    }
  }
  
  /**
   * 
   * @returns páginas totales de la lista para ir cambiando y mostrar los siguientes resultados
   */
  getTotalPages(): number {
    try {
      return Math.ceil(this.CallHistory.length / this.itemsPerPage);
    } catch (err) {
      return err;
    }
  }

  /**
   * Metodo para cerrar el accordion del historial de llamadas y volver
   * a ver la lista de llamadas para atender las solicitudes
   */
  public closeH() {
    try {
      this.history = true;
      this.closeHistory = false;
      this.showHistory = true;
    } catch(err) {
      console.log(err);
    }
  }

  /**
   * En el historial, boton para ver toda la información acerca de la llamada
   * @param Call llamada que queremos ver la información
   */
  public CallInfo(Call:Call) {
    try {
      const minutos = Math.floor(Call.duration);
      const segundos = Math.round((Call.duration - minutos) * 60);
      const tiempoFormateado = `${minutos}' ${segundos}''`;
      this.cajeroService.getCashier(Call.cajeroId).subscribe(
        data => {
          this.nombreInfo = data.ubication;
          this.ipInfo = data.ip;
        }
      )
      this.cajeroInfoId = Call.cajeroId;
      this.fechaInfo = Call.formatted;
      this.durationInfo = tiempoFormateado;
      this.ratingInfo = Call.rating;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Metodo para cerrar el accordion cuando pulsamos un boton
   * @param id del accordion que queremos cerrar
   */
  public CloseAccordion(id:string) {
    try {
      var myCollapse = document.getElementById(id);
      var bsCollapse = new bootstrap.Collapse(myCollapse, {
      show: false
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Metodo para abrir el accordion cuando pulsemos un boton
   * @param id del accordion que queremos abrir
   */
  public ExpandAccordion(id:string) {
    try {
      var myCollapse = document.getElementById(id);
      var bsCollapse = new bootstrap.Collapse(myCollapse, {
      show: true
      });
    } catch (err) {
      console.log(err);
    }
  }
}
