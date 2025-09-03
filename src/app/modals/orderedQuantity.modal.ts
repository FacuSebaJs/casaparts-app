import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { firstValueFrom, fromEvent, Observable, Subject, take, takeUntil } from 'rxjs';
import { OrderService } from '../core/services/api/order.service';
import { SessionService } from '../core/services/session.service';
import { ToastrService } from 'ngx-toastr';
import { ArticuloService } from '../core/services/api/articulo.service';
import { ConfigClienteService } from '../core/services/api/config_cliente.service';


@Component({
  selector: 'app-ordered-quantity',
  standalone: false,
  templateUrl: './orderedQuantity.modal.html',
  styleUrls: ['./orderedQuantity.modal.css']
})
export class OrderedQuantityModal implements OnInit {

  @Input() openModal!: Observable<void>;
  @Input() art!: any;
  @Output() closingAction = new EventEmitter<void>();

  @ViewChild('buttonOpenModal') private readonly buttonOpenModal!: ElementRef<HTMLButtonElement>;
  @ViewChild('buttonCloseModal') private readonly buttonCloseModal!: ElementRef<HTMLButtonElement>;
  @ViewChild('refCantidadInput') private refCantidadInput!: ElementRef<HTMLInputElement>;

  cantidad: number = 0;
  cantidadInput: number | null = 1;
  cliente: any;
  configCliente = { general: null, contado: null, tarjeta: null, descuento: null };
  private readonly unsubscribe$ = new Subject<void>();

  constructor(private _orderService: OrderService, private _sessionService: SessionService, private _toastrService: ToastrService, private _articuloService: ArticuloService, private _configClienteService: ConfigClienteService) { }

  ngOnInit(): void {
    this.openModal
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.cliente = this._sessionService.getUser();
        this.buttonOpenModal.nativeElement.click();
        this.orderQuantity();
        fromEvent(document.getElementById('orderedQuantityModal')!, 'shown.bs.modal')
          .pipe(take(1))
          .subscribe(() => {
            setTimeout(() => {
              if (this.refCantidadInput) {
                this.refCantidadInput.nativeElement.focus();
                this.refCantidadInput.nativeElement.select();
              }
            }, 0);
          });
      });
  }

  close(): void {
    this.cantidadInput = null;
    this.buttonCloseModal.nativeElement.click();
    this.closingAction.emit();
  }

  async accept(): Promise<void> {
    try {
      if (this.cantidadInput) {
        // this._homeService.setArticulo(this.art, Number(this.cantidad) + Number(this.cantidadInput));
        if (this.cantidadInput % (this.art.ENVASE || 1) == 0) {
          // this.spinnerButton = true;
          // await this._homeService.newDetail(this.art, Number(this.cantidadInput));
          await this.newDetail();
          // this.spinnerButton = false;
          this.close();
        }
        else {
          this._toastrService.error(`La cantidad ingresada debe ser múltiplo de la unidad de envase`, 'Error');
        }
      }
    }
    catch (err) {
      // this.spinnerButton = false;
      this._toastrService.error('No se pudo agregar el artículo', 'Error');
      this.close()
    }
  }

  async cargarConfigCliente(): Promise<void> {
    try {
      const configCliente = await firstValueFrom(this._configClienteService.getConfig(Number(this.cliente)));
      this.configCliente = configCliente;
    } catch (err) {
      console.error('Error cargando configuración de cliente', err);
      throw err;
    }
  }

  async calcularPrecio(articulo: any): Promise<any> {
    try {
      const coeficientes = await firstValueFrom(this._articuloService.getCoefArt(Number(this.cliente), articulo.CODIGO));
      let precio = { costo: 0, venta: 0, contado: 0, tarjeta: 0 };
      precio.costo = this.twoDecimal(this.twoDecimal(articulo.PRECIO) - this.twoDecimal(articulo.PRECIO * Number(this.configCliente.descuento) / 100));
      precio.venta = this.twoDecimal(this.twoDecimal(precio.costo) + this.twoDecimal((precio.costo * (coeficientes && coeficientes.Coef ? coeficientes.Coef : this.configCliente.general) / 100).toFixed(2)));
      precio.contado = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * Number(this.configCliente.contado) / 100));
      precio.tarjeta = this.twoDecimal(this.twoDecimal(precio.venta) + this.twoDecimal(precio.venta * Number(this.configCliente.tarjeta) / 100));
      if (articulo.DTO) {
        precio.costo = this.twoDecimal(this.twoDecimal(precio.costo) - this.twoDecimal(precio.costo * articulo.DTO / 100));
        precio.venta = this.twoDecimal(this.twoDecimal(precio.venta) - this.twoDecimal(precio.venta * articulo.DTO / 100));
        precio.contado = this.twoDecimal(this.twoDecimal(precio.contado) - this.twoDecimal(precio.contado * articulo.DTO / 100));
        precio.tarjeta = this.twoDecimal(this.twoDecimal(precio.tarjeta) - this.twoDecimal(precio.tarjeta * articulo.DTO / 100));
      }
      return precio;
    } catch (err) {
      console.error('Error cargando configuración de cliente', err);
      throw err;
    }
  }

  private twoDecimal(value: any): number {
    return Number(Number(value).toFixed(2));
  }

  private async orderQuantity(): Promise<void> {
    try {
      const cliente = this._sessionService.getUser();
      const response = await firstValueFrom(this._orderService.getBuy(cliente));
      this.cantidad = 0;
      if (this.art.QSTOCK == 'N' || this.art.QSTOCK == 'X') {
        this.cantidadInput = null;
      }
      else {
        this.cantidadInput = this.art.ENVASE ? this.art.ENVASE : 1;
      }
      if (response) {
        for (let item of response) {
          if (item.articulo.CODIGO == this.art.CODIGO) {
            this.cantidad = item.cantidad;
            break;
          }
        }
      }
    }
    catch (err) {
      console.error('Error cargando cantidad previa del artículo', err);
    }
  }

  private async newDetail(): Promise<void> {
    try {
      let id_pedido = null;
      const response = await firstValueFrom(this._orderService.getBuy(this.cliente));
      if (response && response.length > 0) {
        id_pedido = response[0].id_pedido;
      }
      const precios = await this.calcularPrecio(this.art);
      const detalle = {
        id_articulo: this.art.CODIGO,
        cantidad: this.cantidadInput,
        COSTO: precios.costo,
        VENTA: precios.venta,
        CONTADO: precios.contado,
        TARJETA: precios.tarjeta
      };
      const pedido = {
        id_cliente: this.cliente,
        id: id_pedido,
        id_articulo: this.art.CODIGO,
        cantidad: this.cantidadInput,
        COSTO: precios.costo,
        VENTA: precios.venta,
        CONTADO: precios.contado,
        TARJETA: precios.tarjeta
      };
      await firstValueFrom(this._orderService.newDetail(pedido, detalle));
    }
    catch (err) {
      console.error('Error al agregar artículo al pedido', err);
    }
  }

}