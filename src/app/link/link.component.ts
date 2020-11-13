import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
  public href = `${environment.kratos_public}/self-service/login/browser`;
  constructor() { }

  ngOnInit() {
  }

}
