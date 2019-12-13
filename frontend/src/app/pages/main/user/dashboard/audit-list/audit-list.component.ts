import { Component, OnInit } from '@angular/core';
import { UnauditedUser } from '../../../../../models/user.model';
import { ROLE_NAMES } from '../../../../../models/role.model';
import {UserService} from '../../../../../services/user.service';
import {NzMessageService} from 'ng-zorro-antd';
import {PrivateKeyService} from '../../../../../services/private-key.service';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.less']
})
export class AuditListComponent implements OnInit {
  auditList: UnauditedUser[];
  roleNames = ROLE_NAMES;

  constructor(private userService: UserService,
              private privateKeyService: PrivateKeyService,
              private messageService: NzMessageService) {
    userService.getUnauditedUsers().then(c => this.auditList = c);
  }

  ngOnInit() {
  }

  acceptUser(unauditedUser: UnauditedUser) {
    this.privateKeyService.request.next({
      callback: () => {
        this.userService.acceptUser(unauditedUser.id)
          .then(() => {
            unauditedUser.audited = true;
            this.messageService.success('成功接受用户注册申请');
          });
      }
    });
  }

  rejectUser(unauditedUser: UnauditedUser) {
    this.privateKeyService.request.next({
      callback: () => {
        this.userService.rejectUser(unauditedUser.id)
          .then(() => {
            unauditedUser.audited = false;
            this.messageService.success('成功拒绝用户注册申请');
          });
      }
    });
  }

}
