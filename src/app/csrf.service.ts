import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken: string = null;

  constructor() {
  }

  get_token(): string {
    console.log('Get ' + this.csrfToken);
    return this.csrfToken;
  }

  set_token(token: string) {
    this.csrfToken = token;
    console.log('Set ' + token);
  }
}
