import {Component, OnInit} from '@angular/core';
import {LoginFlow, LoginFlowMethod, Message} from '@oryd/kratos-client';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, iif, of} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private login$ = new BehaviorSubject<LoginFlowMethod>(null);
  private messages$ = new BehaviorSubject<Message[]>(null);

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
          map(() => ({flow: null, config: null, messages: null}))
        ),
        this.http.get(`${environment.kratos_public}/self-service/login/flows?id=${flow}`,
          {withCredentials: true}).pipe(
          map<LoginFlow, { flow: string, config: LoginFlowMethod, messages: Message[] }>(res => ({
            flow,
            config: res.methods.password,
            messages: res.messages
          }))
        )
      )),
    ).subscribe(res => {
      let messages = res.messages;
      if (messages == null) {
        messages = res.config.config.messages;
      } else if (res.config.config.messages !== null) {
        messages.concat(res.config.config.messages);
      }
      this.login$.next(res.config);
      this.messages$.next(messages);
    });
  }

  get_token(config: LoginFlowMethod) {
    const fields = config.config.fields;
    for (const f of fields) {
      if (f.name === 'csrf_token') {
        return f.value;
      }
    }
    return null;
  }
}
