import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/api/order.service';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-orderHistory',
    standalone: false,
    templateUrl: './orderHistory.component.html',
    styleUrls: ['./orderHistory.component.css']
})
export class OrderHistoryComponent implements OnInit {

    orders: any[] = [];
    spinner: boolean = false;

    constructor(private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService, private _socketService: SocketService, private _toastrService: ToastrService) {
    }

    trackByIndex(i: number): number {
        return i;
    }

    ngOnInit(): void {
        this.cargaInicial();
    }


    showDetail(id: number) {
        this.router.navigate(['/orderDetail', id]);
    }

    async allOrders(): Promise<void> {
        this.spinner = true;
        const cliente = this._sessionService.getClient();
        const orders = await firstValueFrom(this._orderService.getAllOrders(cliente));
        this.orders = orders;
        this.spinner = false;
    }

    private async latestOrders(): Promise<void> {
        const cliente = this._sessionService.getClient();
        const orders = await firstValueFrom(this._orderService.getLatestOrders(cliente));
        console.log(orders);
        this.orders = orders;
    }

    async cargaInicial(): Promise<void> {
        this.spinner = true;
        await this.latestOrders();
        this.spinner = false;
    }

}