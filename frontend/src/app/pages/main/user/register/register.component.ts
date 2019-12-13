import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {checkIfFormPassesValidation} from '../../../../utils/form';
import {UserService} from '../../../../services/user.service';
import {ProfileResponse, RegisterResponse} from '../../../../models/user.model';
import {Role} from '../../../../models/role.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  govs?: ProfileResponse[];
  type: string;
  isVisible = false;
  response: RegisterResponse;

  submitForm(): void {
    checkIfFormPassesValidation(this.form).then(valid => {
      if (!valid) { return; }

      this.userService.register({
        username: this.form.controls.username.value,
        password: this.form.controls.password.value,
        government: this.form.controls.government.value,
        name: this.form.controls.name.value,
        role: this.form.controls.role.value
      }).then(response => {
        this.response = response;
        this.isVisible = true;
      }).catch(err => {
        console.log(err);
        this.messageService.error('请重试');
      });
    });
  }

  navigate() {
    this.router.navigate(['/user', 'login']);
  }

  updateType(type: string) {
    this.type = type;
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.form.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.form.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  checkGovernment = (control: FormControl): { [s: string]: boolean } => {
    if (this.type === Role.Company) {
      if (!control.value) {
        return { required: true };
      } else {
        return {};
      }
    } else {
      return {};
    }
  }

  checkUsername(control: FormControl) {
    return this.userService.validate('username', control.value)
      .then(x => x.ok ? {} : { conflict: true })
      .catch(err => ({ network: true }));
  }

  checkName(control: FormControl) {
    return this.userService.validate('name', control.value)
      .then(x => x.ok ? {} : { conflict: true })
      .catch(() => ({ network: true }));
  }

  constructor(private fb: FormBuilder,
              private router: Router,
              private messageService: NzMessageService,
              private userService: UserService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{2,40}$/)], [this.checkUsername.bind(this)]],
      role: [null, [Validators.required]],
      password: [null, [Validators.required]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]],
      government: [null, [this.checkGovernment]],
      name: [null, [Validators.required, Validators.pattern(/^.{1,40}$/)], [this.checkName.bind(this)]],
    });
    this.userService.getAccounts('government').then(s => this.govs = s);
  }

}
