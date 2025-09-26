import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderComponent } from './order.component';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { OrderRoutingModule } from './order-routing.module';
import { OrderService } from '../../core/services/api/order.service';
import { ConfirmationModule } from '../../modals/confirmation/confirmation.module';


@NgModule({
    declarations: [OrderComponent],
    imports: [CommonModule, FormsModule, OrderRoutingModule, ConfirmationModule],
    providers: [ArticuloService, ConfigClienteService, OrderService],
    exports: []
})
export class OrderModule { }