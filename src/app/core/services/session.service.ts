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

    setLoginData(data: { client: string, email: string, password: string, token: string }): void {
        this.setCLient(data.client);
        this.setEmail(data.email);
        this.setPassword(data.password);
        this.setToken(data.token);
    }

    getClient(): string | null {
        const user = localStorage.getItem('user');
        if (user) {
            return user;
        }
        else {
            this.checkSession({ status: 401 });
            return null;
        }
    }

    private setCLient(client: string): void {
        localStorage.setItem('loginClient', client);
    }

    getEmail(): string | null {
        return localStorage.getItem('loginEmail');
    }

    private setEmail(email: string): void {
        localStorage.setItem('loginEmail', email);
    }

    getPassword(): string | null {
        return localStorage.getItem('loginPassword');
    }

    private setPassword(password: string): void {
        localStorage.setItem('loginPassword', password);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string): void {
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