import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { firstValueFrom, fromEvent, Observable, Subject, take, takeUntil } from 'rxjs';
import { OrderService } from '../core/services/api/order.service';
import { SessionService } from '../core/services/session.service';
import { ToastrService } from 'ngx-toastr';


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
  private readonly unsubscribe$ = new Subject<void>();

  constructor(private _orderService: OrderService, private _sessionService: SessionService, private _toastrService: ToastrService) { }

  ngOnInit(): void {
    this.openModal
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
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

  close() {
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
      console.log("checkCant:", err);
      return;
    }
  }

}