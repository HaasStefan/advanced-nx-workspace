import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userName = new BehaviorSubject<string>('Max Mustermann');
  readonly userName$ = this._userName.asObservable();
  
  set userName(value: string) {
    this._userName.next(value);
  }

  get userName(): string {
    return this._userName.getValue();
  }
}
