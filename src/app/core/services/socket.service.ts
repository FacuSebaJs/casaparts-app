import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class SocketService {

    private socketStatus: boolean;
    private status: Subject<Date>;
    private lastChange: string;

    constructor(
        private readonly socket: Socket,
        private readonly _sessionService: SessionService
    ) {
        this.socketStatus = true;
        this.status = new Subject<Date>();
        this.lastChange = '';
    }

    connect(): void {
        if (!this.socketStatus) {
            this.socket.connect();
            this.socketStatus = true;
            this.status.next(new Date());
        }
    }

    disconnect(): void {
        if (this.socketStatus) {
            this.socket.disconnect();
            this.socketStatus = false;
        }
    }

    getStatus() {
        return this.socketStatus;
    }

    getLastChange() {
        return this.lastChange;
    }

    getId() {
        return this.socket.ioSocket.id;
    }

    changeStatus(): Observable<Date> {
        return this.status.asObservable();
    }

    connected(): Observable<any> {
        this.socket.removeAllListeners();
        return new Observable<any>((observer) => {
            this.socket.on('connected', (message) => {
                observer.next(message);
                this.socketStatus = true;
                this.lastChange = "connected";
                this.changeDetected();
            });
            this.socket.on("disconnect", (reason) => {
                console.log("disconnect:", reason);
                this.socketStatus = false;
                this.lastChange = "disconnect";
                this.changeDetected();
            });
            this.socket.on("reconnect", () => {
                console.log("reconnect:");
                this.socketStatus = true;
                this.lastChange = "reconnect";
                this.changeDetected();
            });
            this.socket.on("connect_error", () => {
                console.log("connect_error");
                this.socketStatus = false;
                this.lastChange = "connect_error";
                this.changeDetected();
            });
        });
    }

    connectRoom(): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('connectRoom', user);
        }
    }

    connectedRoom(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('connectedRoom', (message) => {
                observer.next(message);
            });
        });
    }

    joinedClient(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('joinedClient', (message) => {
                observer.next(message);
            });
        });
    }

    changePedido(): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changePedido', user);
        }
    }
    changedPedido(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedPedido', (message) => {
                observer.next(message);
            });
        });
    }

    changedOrder(): Observable<{ order: number, isNew: boolean }> {
        return new Observable<{ order: number, isNew: boolean }>((observer) => {
            this.socket.on('changedOrder', (message: { order: number, isNew: boolean }) => {
                observer.next(message);
            });
        });
    }

    changedOrderDetail(): Observable<string> {
        return new Observable<string>((observer) => {
            this.socket.on('changedOrderDetail', (message: string) => {
                console.log("changedOrderDetail:", message);
                observer.next(message);
            });
        });
    }

    startOrder(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('startOrder', (message) => {
                observer.next(message);
            });
        });
    }

    changeConfig(config: any): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changeConfig', user, config);
        }
    }

    changedConfig(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedConfig', (message) => {
                observer.next(message);
            });
        });
    }

    changeLocation(location: any): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changeLocation', user, location);
        }
    }

    changedLocation(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedLocation', (location) => {
                observer.next(location);
            });
        });
    }

    changeBanner(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedBanner', () => {
                observer.next(null);
            });
        });
    }

    changedData(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedData', () => {
                observer.next(null);
            })
        })
    }

    sendProduct(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('sendProduct', (product) => {
                observer.next(product);
            })
        })
    }

    confirmExtension(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('confirmExtension', () => {
                observer.next(null);
            })
        })
    }

    private changeDetected() {
        this.status.next(new Date());
    }

}
