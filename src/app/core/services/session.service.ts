import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionService {

    constructor(private _router: Router) { }

    public async checkSession(response: Partial<HttpResponse<any>>): Promise<any> {
        try {
            if (response.status == 401) {
                let message: string = 'Debe logearse para poder usar la aplicación';
                localStorage.removeItem('token');
                await this._router.navigate(['auth']);
                console.log(message, 'Sesión caducada');
                return null;
            }
            else {
                return response.body;
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    public getUser() {
        const user = localStorage.getItem('user');
        if (user) {
            return user;
        }
        else {
            this.checkSession({ status: 401 });
            return null;
        }
    }

    public setUser(user: string) {
        localStorage.setItem('user', user);
    }


    public getToken() {
        return localStorage.getItem('token');
    }

    public setToken(token: string) {
        localStorage.setItem('token', token);
    }

    public getBuy() {
        const buy = localStorage.getItem('buy');
        return buy ? JSON.parse(buy) : [];
    }

    public setBuy(buy: any) {
        localStorage.setItem('buy', JSON.stringify(buy));
    }

}