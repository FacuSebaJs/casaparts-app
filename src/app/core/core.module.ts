import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ArticuloService } from './services/api/articulo.service';
import { ConfigClienteService } from './services/api/config_cliente.service';

@NgModule({
    imports: [],
    providers: [AuthService, ArticuloService, ConfigClienteService],
    exports: []
})
export class CoreModule { }