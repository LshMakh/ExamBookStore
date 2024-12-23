import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './pages/manager/manager.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { CartComponent } from './pages/cart/cart.component';

const routes: Routes = [
  { path: 'manager', component: ManagerComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'cart', component: CartComponent },
  { path: '', redirectTo: '/customer', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }