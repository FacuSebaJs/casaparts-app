import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutComponent } from './checkout.component';
import { CheckoutRoutingModule } from './checkout-routing.module';


@NgModule({
    declarations: [CheckoutComponent],
    imports: [CommonModule, FormsModule, CheckoutRoutingModule],
    providers: [],
    exports: []
})
export class CheckoutModule { }