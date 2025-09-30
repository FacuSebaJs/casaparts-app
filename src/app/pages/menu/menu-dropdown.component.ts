import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { OrderService } from '../../core/services/api/order.service';
import { SocketService } from '../../core/services/socket.service';
import { firstValueFrom, Subject, Subscription, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'bootstrap';

@Component({
    selector: 'app-menu-dropdown',
    standalone: false,
    templateUrl: './menu-dropdown.component.html',
    styleUrls: ['./menu-dropdown.component.css'],
})
export class MenuDropdownComponent implements OnInit {
    articulosCarrito = 0;
    cliente: any = null;
    obsSocConnect = new Subscription();
    obsSocRoom = new Subscription();
    obsChangedOrder = new Subscription();
    obsChangedOrderDetail = new Subscription();
    unsubscribe$ = new Subject<void>();
    isOpen: boolean = false;

    constructor(private router: Router, private _sessionService: SessionService, private _orderService: OrderService, private _socketService: SocketService, private _toastrService: ToastrService, private elementRef: ElementRef) { }

    ngOnInit(): void {
        this.cargaInicial();
    }

    async cargaInicial(): Promise<void> {
        this.cliente = this._sessionService.getClient();
        await this.cargarCarrito();
        this.initSocket();
    }

    toggleMenu(force: boolean, show?: boolean): void {
        const dropdownButton = document.getElementById("dropdownMenuButton");
        if (dropdownButton) {
            const dropdownInstance = Dropdown.getOrCreateInstance(dropdownButton);
            if (force == true) {
                if (show == true && !this.isOpen) {
                    dropdownInstance.show();
                    this.isOpen = true;
                }
                else if (show == false && this.isOpen) {
                    dropdownInstance.hide();
                    this.isOpen = false;
                }
            }
            else {
                this.isOpen ? dropdownInstance.hide() : dropdownInstance.show();
                this.isOpen = !this.isOpen;
            }
        }
    }

    irAlCarrito(): void {
        if (this.articulosCarrito > 0) {
            this.toggleMenu(true, false);
            this.router.navigate(['/order']);
        }
    }

    irAlHistorial(): void {
        this.toggleMenu(true, false);
        this.router.navigate(['/orderHistory']);
    }

    irAlHome(): void {
        this.toggleMenu(true, false);
        this.router.navigate(['/home']);
    }

    logout(): void {
        this._socketService.disconnect();
        this.toggleMenu(true, false);
        this._sessionService.removeToken();
        window.location.reload();
    }

    removeSockets(): void {
        if (this.obsSocConnect) {
            this.obsSocConnect.unsubscribe();
        }
        if (this.obsSocRoom) {
            this.obsSocRoom.unsubscribe();
        }
        if (this.obsChangedOrder) {
            this.obsChangedOrder.unsubscribe();
        }
        if (this.obsChangedOrderDetail) {
            this.obsChangedOrderDetail.unsubscribe();
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside && this.isOpen) {
            this.toggleMenu(true, false);
        }
    }

    async cargarCarrito(): Promise<void> {
        try {
            const buy = await firstValueFrom(this._orderService.getBuy(this.cliente));
            this.articulosCarrito = buy.length;
        }
        catch (err) {
            console.error('Error obteniendo cantidad del carrito', err);
        }
    }

    private initSocket(): void {
        this._socketService.connect();
        this.removeSockets();
        this.obsSocConnect = this._socketService.connected()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((message) => {
                console.info('%c' + message, 'color:Lightgreen');
                this._socketService.connectRoom();
            });
        this.obsSocRoom = this._socketService.connectedRoom()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((message) => {
                console.info('%c' + message, 'color:Lightgreen');
            });
        this.obsChangedOrder = this._socketService.changedOrder()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (data) => {
                const action: string = data.isNew ? 'generado' : ' actualizado';
                let order: number = 1;
                const response = await firstValueFrom(this._orderService.getBuyIcon(Number(this.cliente)));
                if (data.order) {
                    order = data.order;
                }
                else if (response && response.order.length) {
                    order = response.order[0].order + 1;
                }
                const message: string = `Se ha ${action} el pedido N° ${order}`;
                this._toastrService.info(message);
            })
        this.obsChangedOrderDetail = this._socketService.changedOrderDetail()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data) => {
                const action: string = data == 'agregar' ? 'agregado' : 'modificado';
                let message: string = `Se ha ${action} artículo/s en su compra`;
                if (data == 'quitar') {
                    message = `Quitando artículos`;
                }
                if (data == 'iniciar') {
                    message = `Se ha iniciado una nueva compra`;
                }
                if (data != 'quitar') {
                    this._toastrService.info(message, 'Información');
                    this.toggleMenu(true, true);
                }
                this.cargarCarrito();
            })
    }

}
