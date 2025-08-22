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

    public connect(): void {
        this.socket.connect();
        this.socketStatus = true;
        this.status.next(new Date());
    }

    public disconnect(): void {
        if (this.socketStatus) {
            this.socket.disconnect();
            this.socketStatus = false;
        }
    }

    public getStatus() {
        return this.socketStatus;
    }

    public getLastChange() {
        return this.lastChange;
    }

    public getId() {
        return this.socket.ioSocket.id;
    }

    public changeStatus(): Observable<Date> {
        return this.status.asObservable();
    }

    public connected(): Observable<any> {
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

    private changeDetected() {
        this.status.next(new Date());
    }

    public connectRoom(): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('connectRoom', user);
        }
    }
    public connectedRoom(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('connectedRoom', (message) => {
                observer.next(message);
            });
        });
    }

    public joinedClient(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('joinedClient', (message) => {
                observer.next(message);
            });
        });
    }

    public changePedido(): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changePedido', user);
        }
    }
    public changedPedido(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedPedido', (message) => {
                observer.next(message);
            });
        });
    }

    public changedOrder(): Observable<{ order: number, isNew: boolean }> {
        return new Observable<{ order: number, isNew: boolean }>((observer) => {
            this.socket.on('changedOrder', (message: { order: number, isNew: boolean }) => {
                observer.next(message);
            });
        });
    }

    public changedOrderDetail(): Observable<string> {
        return new Observable<string>((observer) => {
            this.socket.on('changedOrderDetail', (message: string) => {
                console.log("changedOrderDetail:", message);
                observer.next(message);
            });
        });
    }

    public startOrder(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('startOrder', (message) => {
                observer.next(message);
            });
        });
    }

    public changeConfig(config: any): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changeConfig', user, config);
        }
    }
    public changedConfig(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedConfig', (message) => {
                observer.next(message);
            });
        });
    }

    public changeLocation(location: any): void {
        const user = this._sessionService.getUser();
        if (user) {
            this.socket.emit('changeLocation', user, location);
        }
    }
    public changedLocation(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedLocation', (location) => {
                observer.next(location);
            });
        });
    }

    public changeBanner(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedBanner', () => {
                observer.next(null);
            });
        });
    }

    public changedData(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('changedData', () => {
                observer.next(null);
            })
        })
    }

    public sendProduct(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('sendProduct', (product) => {
                observer.next(product);
            })
        })
    }

    public confirmExtension(): Observable<any> {
        return new Observable<any>((observer) => {
            this.socket.on('confirmExtension', () => {
                observer.next(null);
            })
        })
    }

}
