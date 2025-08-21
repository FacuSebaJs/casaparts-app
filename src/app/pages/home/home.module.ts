import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { ConfigClienteService } from '../../core/services/api/config_cliente.service';
import { HomeRoutingModule } from './home-routing.module';


@NgModule({
    declarations: [HomeComponent],
    imports: [CommonModule, FormsModule, HomeRoutingModule],
    providers: [ArticuloService, ConfigClienteService],
    exports: []
})
export class HomeModule { }