import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderItem } from '../../core/services/api/cart.service';
import { OrderService } from '../../core/services/api/order.service';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';
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
export class OrderHistoryComponent implements OnInit, OnDestroy {

    orders: any[] = [];
    spinner: boolean = false;

    constructor(private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService, private _socketService: SocketService, private _toastrService: ToastrService) {
    }

    trackByIndex(i: number): number {
        return i;
    }

    ngOnInit(): void {
        this.cargaInicial();
        // this.initSocket();
    }

    ngOnDestroy(): void {
        // this.removeListener();
        // this.removeSockets();
    }

    showDetail(id: number) {
        this.router.navigate(['/orderDetail', id]);
    }

    private async latestOrders(): Promise<void> {
        const cliente = this._sessionService.getClient();
        const orders = await firstValueFrom(this._orderService.getLatestOrders(cliente));
        this.orders = orders;
    }

    private async cargaInicial(): Promise<void> {
        this.spinner = true;
        await this.latestOrders();
        this.spinner = false;
    }

}