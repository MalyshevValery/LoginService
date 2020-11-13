import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Route} from '@angular/router';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of, Subject} from 'rxjs';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  public error$ = new Subject();

  constructor(private http: HttpClient, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      map(params => params.error),
      switchMap(error =>
        this.http.get(`${environment.kratos_public}/self-service/errors?error=string`)
      ),
      catchError(err => of(err)),
      map(res => res.error.error),
    ).subscribe(this.error$);
  }

}
