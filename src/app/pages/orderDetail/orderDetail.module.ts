import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderDetailComponent } from './orderDetail.component';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { OrderDetailRoutingModule } from './orderDetail-routing.module';
import { OrderService } from '../../core/services/api/order.service';


@NgModule({
    declarations: [OrderDetailComponent],
    imports: [CommonModule, FormsModule, OrderDetailRoutingModule],
    providers: [ArticuloService, ConfigClienteService, OrderService],
    exports: []
})
export class OrderDetailModule { }