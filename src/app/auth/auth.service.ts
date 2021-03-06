import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authStatus = new BehaviorSubject<boolean>(false);
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string{
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatus.asObservable();
  }

  getAuthStatus() {
    return this.authStatus.value;
  }

  createUser(email: string, password: string){
    const authData: AuthData = {email: email, password: password};
    this.http.post("http://localhost:3000/api/users/signup", authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string){
    const authData: AuthData = {email: email, password: password};
    this.http.post<{data: {token: string, expiresIn: number}}>("http://localhost:3000/api/users/login", authData)
      .subscribe(response => {
        const expiresInDuration = response.data.expiresIn;
        this.setAuthTimer(expiresInDuration * 1000);

        this.token = response.data.token;
        this.authStatus.next(true);

        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(this.token, expirationDate);

        this.router.navigate(['/']);
      });
  }

  logout() {
    this.token = null;
    this.authStatus.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if(!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0){
      this.token = authInformation.token;
      this.setAuthTimer(expiresIn)
      this.authStatus.next(true);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(()=>{ //set a timer to perform this function after token expires
      this.logout();
    }, duration);
  }

  private saveAuthData(token: string, expirationDate: Date){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(){
    localStorage.clearItem('token');
    localStorage.clearItem('expiration');
  }

  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if(!token || !expirationDate){
      return;
    }
    return {token: token, expirationDate: new Date(expirationDate)};
  }
}
