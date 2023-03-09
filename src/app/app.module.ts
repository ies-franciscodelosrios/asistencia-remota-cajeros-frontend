import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { LoginComponent } from './components/login/login.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CallService } from './services/call.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragableDirective } from './directives/dragable.directive';
import { DragableHandlerDirective } from './directives/dragable-handler.directive';
import { MaximizeDirective } from './directives/maximize.directive';
import { RemoteComponent } from './components/remote/remote';
import {HttpClientModule} from '@angular/common/http';
import { SignalrService } from './services/signalr.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainMenuComponent,
    DragableDirective,
    DragableHandlerDirective,
    MaximizeDirective,
    RemoteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ClipboardModule,
    MatSnackBarModule,
    HttpClientModule
  ],
  providers: [
    CallService,
    SignalrService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
