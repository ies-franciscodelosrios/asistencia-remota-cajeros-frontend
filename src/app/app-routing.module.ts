import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';

const routes: Routes = [
  {path:'login',   component:LoginComponent},
  {path:'main-menu', component:MainMenuComponent},
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { path: '**', loadChildren: () => import('./page404/page404.module').then(m => m.Page404Module)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
