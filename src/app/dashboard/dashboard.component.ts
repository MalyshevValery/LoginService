import {Component, OnInit} from '@angular/core';
import jwt_decode from 'jwt-decode';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private info$;

  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.info$ = this.http.get(`${environment.kratos_public}/sessions/whoami`,
      {withCredentials: true});
    this.info$.subscribe(x => console.log(x));
  }

  logout() {
    window.location.href = `${environment.kratos_public}/self-service/browser/flows/logout`;
  }
}
