import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionService {

    constructor(private _router: Router) { }

    async checkSession(response: Partial<HttpResponse<any>>): Promise<any> {
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

    getUser(): string | null {
        const user = localStorage.getItem('user');
        if (user) {
            return user;
        }
        else {
            this.checkSession({ status: 401 });
            return null;
        }
    }

    setUser(user: string): void {
        localStorage.setItem('user', user);
    }


    getToken(): string | null {
        return localStorage.getItem('token');
    }

    setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    removeToken(): void {
        localStorage.removeItem('token');
    }

    getBuy(): any | [] {
        const buy = localStorage.getItem('buy');
        return buy ? JSON.parse(buy) : [];
    }

    setBuy(buy: any): void {
        localStorage.setItem('buy', JSON.stringify(buy));
    }

}