import { Component, OnInit } from '@angular/core';
import {Configuration, LoginFlow, LoginFlowMethod, PublicApi} from '@oryd/kratos-client';
import {environment} from '../../environments/environment';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {from} from 'rxjs';
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
      switchMap(flow => from(this.kratos.getSelfServiceLoginFlow(flow)).pipe(
        map<AxiosResponse<LoginFlow>, any>(res => {
          this.flow = flow;
          if (res.status !== 200) {
            throw new Error('Rejected');
          }
          return res.data.methods.password;
        })))
    ).subscribe(loginFlow => {
      this.login = loginFlow;
    });
    //     .catch(redirectOnSoftError(res, next, '/self-service/login/browser'));
  }

  submit() {
    if (!this.flow) {
      window.location.href = `${environment.kratos_public}/self-service/login/browser`;
      return;
    }
    const config = this.login.config;
    const formData = new FormData();

    for (const field of config.fields) {
      const formField = this.form.controls[field.name];
      if (!formField) {
        formData.append(field.name, field.value as unknown as string);
      } else {
        formData.append(field.name, formField.value);
      }
    }
    this.http.request(config.method, config.action, {body: formData})
      .subscribe(x => console.log(x));

    return;
  }
}
