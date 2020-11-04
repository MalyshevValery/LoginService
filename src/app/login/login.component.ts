import {Component, OnInit} from '@angular/core';
import {Configuration, LoginFlow, LoginFlowMethod, PublicApi} from '@oryd/kratos-client';
import {environment} from '../../environments/environment';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {concatMap, map, switchMap, tap} from 'rxjs/operators';
import {from, iif, of} from 'rxjs';
import {AxiosResponse} from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private kratos = new PublicApi(new Configuration({basePath: environment.kratos_public}));
  private flow = null;
  private login: LoginFlowMethod;

  form: FormGroup = new FormGroup({
    identifier: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      map<Params, string>(params => params.flow),
      switchMap(flow => iif(() => !flow,
        of(flow).pipe(
          tap(() => {
            window.location.href = `${environment.kratos_public}/self-service/login/browser`;
          }),
          map(() => ({flow: null, config: null}))
        ),
        this.http.get(`${environment.kratos_public}/self-service/login/flows?id=${flow}`,
        {withCredentials: true}).pipe(
          map<LoginFlow, { flow: string, config: LoginFlowMethod }>(res => ({flow, config: res.methods.password}))
        )
      )),
    ).subscribe(data => {
      this.login = data.config;
      this.flow = data.flow;
    });
  }

  submit() {
    const config = this.login.config;
    const params = new URLSearchParams();
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*'
    });

    for (const field of config.fields) {
      const formField = this.form.controls[field.name];
      if (!formField) {
        params.set(field.name, field.value as unknown as string);
      } else {
        params.set(field.name, formField.value);
      }
    }
    this.http.request(config.method, config.action, {headers, body: params.toString(), withCredentials: true})
      .subscribe(x => console.log(x));
    return;
  }
}
