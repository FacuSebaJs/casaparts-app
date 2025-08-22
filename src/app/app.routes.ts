// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { HomeComponent } from './pages/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' }, // raíz clara
  { path: 'home', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },         // 👈 nueva ruta
  { path: '**', redirectTo: '' }                              // fallback (opcional)
];
