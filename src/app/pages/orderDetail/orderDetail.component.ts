import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItem } from '../../core/services/api/cart.service';
import { OrderService } from '../../core/services/api/order.service';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { ArticuloService } from '../../core/services/api/articulo.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-orderDetail',
    standalone: false,
    templateUrl: './orderDetail.component.html',
    styleUrls: ['./orderDetail.component.css']
})
export class OrderDetailComponent implements OnInit, OnDestroy {

    orderId?: number;
    spinner: boolean = false;
    order: any = null;
    imagenes: string[] = [];

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private _orderService: OrderService, private _sessionService: SessionService, private _articuloService: ArticuloService, private _socketService: SocketService, private _toastrService: ToastrService) {
    }

    trackByIndex(i: number): number {
        return i;
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id && !isNaN(id)) {
                this.orderId = id;
                this.cargaInicial();
            }
            else {
                this.redirect();
            }
        });
    }


    ngOnDestroy(): void {
        // this.removeListener();
        // this.removeSockets();
    }

    redirect() {
        this.router.navigate(['/order']);
    }

    volver(): void {
        window.history.back();
    }

    private async getDetail(): Promise<void> {
        if (this.orderId) {
            const cliente = this._sessionService.getClient();
            const order = await firstValueFrom(this._orderService.getOne(this.orderId));
            this.order = order;
            console.log(this.order);
            if (order.id_cliente != cliente) {
                this.redirect();
            }
        }
    }

    private async cargaInicial(): Promise<void> {
        this.spinner = true;
        await this.getDetail();
        this.spinner = false;
    }

}