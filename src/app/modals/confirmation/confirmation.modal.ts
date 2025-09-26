import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'app-confirmation',
    standalone: false,
    templateUrl: './confirmation.modal.html',
    styleUrls: ['./confirmation.modal.css']
})
export class ConfirmationModal implements OnInit {

    @Input() openModal!: Observable<void>;
    @Input() description!: string;
    @Output() confirmingAction = new EventEmitter<boolean>();

    @ViewChild('buttonOpenModal') private readonly buttonOpenModal!: ElementRef<HTMLButtonElement>;
    @ViewChild('buttonCloseModal') private readonly buttonCloseModal!: ElementRef<HTMLButtonElement>;

    private readonly unsubscribe$ = new Subject<void>();

    constructor() { }

    ngOnInit(): void {
        this.openModal
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.buttonOpenModal.nativeElement.click();
            });
    }

    close(): void {
        this.buttonCloseModal.nativeElement.click();
    }

    cancel(): void {
        this.close();
        this.confirmingAction.emit(false);
    }

    accept(): void {
        this.close();
        this.confirmingAction.emit(true);
    }

}