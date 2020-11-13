import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, iif, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {
  FormField,
  LoginFlow,
  LoginFlowMethod,
  Message,
  SettingsFlow,
  SettingsFlowMethod,
  SettingsFlowMethodConfig
} from '@oryd/kratos-client';

interface RetType {
  flow: string;
  pass: SettingsFlowMethodConfig;
  profile: SettingsFlowMethodConfig;
  messages: Message[];
}

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.css']
})
export class RecoveryComponent implements OnInit {
  public profile$ = new BehaviorSubject<SettingsFlowMethodConfig>(null);
  public pass$ = new BehaviorSubject<SettingsFlowMethodConfig>(null);
  public messages$ = new BehaviorSubject<Message[]>(null);

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit() {
    this.route.queryParams.pipe(
      map<Params, string>(params => params.flow),
      switchMap(flow => iif(() => !flow,
        of(flow).pipe(
          tap(() => {
            window.location.href = `${environment.kratos_public}/self-service/login/browser`;
          }),
          map(() => ({flow: null, pass: null, profile: null, messages: null}))
        ),
        this.http.get(`${environment.kratos_public}/self-service/settings/flows?id=${flow}`,
          {withCredentials: true}).pipe(
          map<SettingsFlow, RetType>(res => ({
            flow,
            pass: res.methods.password.config,
            profile: res.methods.profile.config,
            messages: res.messages,
          }))
        )
      )),
    ).subscribe(res => {
      console.log(res);
      this.profile$.next(res.profile);
      this.pass$.next(res.pass);
      this.messages$.next(res.messages);
    });
  }

  get_token(config: SettingsFlowMethodConfig) {
    const fields = config.fields;
    for (const f of fields) {
      if (f.name === 'csrf_token') {
        return f.value;
      }
    }
    return null;
  }

  not_csrf(val: FormField) {
    return val.name !== 'csrf_token';
  }

  have_messages(val: FormField) {
    return val.messages !== null;
  }

  to_title(val: string) {
    val = val.substring(7).replace('_', ' ');
    const words = val.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }
}
