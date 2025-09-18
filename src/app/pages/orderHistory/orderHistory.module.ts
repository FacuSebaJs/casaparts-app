import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderHistoryComponent } from './orderHistory.component';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { OrderHistoryRoutingModule } from './orderHistory-routing.module';
import { OrderService } from '../../core/services/api/order.service';


@NgModule({
    declarations: [OrderHistoryComponent],
    imports: [CommonModule, FormsModule, OrderHistoryRoutingModule],
    providers: [ArticuloService, ConfigClienteService, OrderService],
    exports: []
})
export class OrderHistoryModule { }