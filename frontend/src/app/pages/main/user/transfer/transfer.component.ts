import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProfileResponse} from '../../../../models/user.model';
import {checkIfFormPassesValidation} from '../../../../utils/form';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import {UserService} from '../../../../services/user.service';
import {ReceiptService} from '../../../../services/receipt.service';
import {PrivateKeyService} from '../../../../services/private-key.service';
import {getParam} from '../../../../utils/route';
import {ROLE_NAMES} from '../../../../models/role.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.less']
})
export class TransferComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private messageService: NzMessageService,
              private receiptService: ReceiptService,
              private privateKeyService: PrivateKeyService,
              private userService: UserService) {
    this.route.params.subscribe(() => {
      this.initAddress = getParam(route.snapshot, 'address');
    });
  }

  form: FormGroup;
  user: ProfileResponse;
  roleNames = ROLE_NAMES;

  initAddress: string;

  submitForm(): void {
    checkIfFormPassesValidation(this.form).then(valid => {
      if (!valid) { return; }

      this.privateKeyService.request.next({
        callback: () => {
          this.receiptService.transferCredit(
            this.form.controls.debtee.value,
            this.form.controls.amount.value,
            this.form.controls.deadline.value
          ).then(() => {
            this.messageService.info('转账成功，等待对方确认');
            this.router.navigate(['/user', 'dashboard']);
          }).catch(err => {
            console.log(err);
            this.messageService.error('请重试');
          });
        }
      });
    });
  }

  checkAddress(control: FormControl) {
    return this.userService.getAddressProfile(control.value)
      .then(x => {
        this.user = x;
        return {};
      })
      .catch(() => ({ inexistent: true }));
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      debtee: [this.initAddress, [Validators.required, Validators.pattern(/^0x[a-z0-9_]{40}$/)], [this.checkAddress.bind(this)]],
      amount: [null, [Validators.required, Validators.pattern(/^[0-9]{1,40}$/)]],
      deadline: [null, [Validators.required]]
    });
  }

}
