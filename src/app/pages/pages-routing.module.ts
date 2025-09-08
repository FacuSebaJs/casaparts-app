import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loginGuard } from '../guards/login.guard';
import { sessionGuard } from '../guards/session.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
    canActivate: [loginGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [sessionGuard]
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.module').then(m => m.OrderModule),
    canActivate: [sessionGuard]
  },
  {
    path: 'orderHistory',
    loadChildren: () => import('./orderHistory/orderHistory.module').then(m => m.OrderHistoryModule),
    canActivate: [sessionGuard]
  },
  {
    path: 'orderDetail',
    loadChildren: () => import('./orderDetail/orderDetail.module').then(m => m.OrderDetailModule),
    canActivate: [sessionGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
