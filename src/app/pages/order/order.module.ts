import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartComponent } from './cart.component';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { OrderRoutingModule } from './order-routing.module';


@NgModule({
    declarations: [CartComponent],
    imports: [CommonModule, FormsModule, OrderRoutingModule],
    providers: [ArticuloService, ConfigClienteService],
    exports: []
})
export class OrderModule { }