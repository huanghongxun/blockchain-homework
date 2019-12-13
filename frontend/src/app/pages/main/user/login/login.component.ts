import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import {UserService} from '../../../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  logging = false;
  returnUrl = '/user/dashboard';

  submitForm(): void {
    for (const i of Object.keys(this.form.controls)) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      this.logging = true;
      this.userService.login({
        username: this.form.controls.userName.value,
        password: this.form.controls.password.value
      }).then(user => {
        this.router.navigateByUrl(this.returnUrl);
        this.message.success('登录成功');
        this.logging = false;
      }).catch(err => {
        this.message.error('登录失败');
        this.logging = false;
      });
    }
  }

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private message: NzMessageService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      contest: [null],
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });

    this.route.queryParams.subscribe(params => {
      if (params.returnUrl) {
        this.returnUrl = params.returnUrl;
      }
    });
  }
}
