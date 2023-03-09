import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page404Component } from './page404/page404.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: Page404Component
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class Page404Module { }
