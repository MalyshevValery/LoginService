import {Component, OnInit} from '@angular/core';
import {LoginFlow, LoginFlowMethod, Message} from '@oryd/kratos-client';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, iif, of} from 'rxjs';
import {CsrfService} from '../csrf.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public methods$ = new BehaviorSubject<LoginFlowMethod>(null);
  public oidc$ = new BehaviorSubject<LoginFlowMethod>(null);
  public messages$ = new BehaviorSubject<Message[]>(null);

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient,
              public csrf: CsrfService) {
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      map<Params, string>(params => params.flow),
      switchMap(flow => iif(() => !flow,
        of(flow).pipe(
          tap(() => {
            window.location.href = `${environment.kratos_public}/self-service/login/browser`;
          }),
          map(() => ({flow: null, login: null}))
        ),
        this.http.get(`${environment.kratos_public}/self-service/login/flows?id=${flow}`,
          {withCredentials: true}).pipe(
          map<LoginFlow, { flow: string, login: LoginFlow }>(res => ({
            flow,
            login: res
          }))
        )
      )),
    ).subscribe(res => {
      const messages = res.login.messages;
      // if (messages == null) {
      //   messages = res.config.config.messages;
      // } else if (res.config.config.messages !== null) {
      //   messages.concat(res.config.config.messages);
      // }
      this.methods$.next(res.login.methods);
      this.messages$.next(messages);
      for (const f of res.login.methods.password.config.fields) {
        if (f.name === 'csrf_token') {
          this.csrf.set_token(f.value);
          break;
        }
      }

    });
  }
}
