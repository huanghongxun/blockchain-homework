import { Component, OnInit } from '@angular/core';
import {AuditedUser} from '../../../../../models/user.model';
import {ROLE_NAMES} from '../../../../../models/role.model';
import {UserService} from '../../../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-audited-list',
  templateUrl: './audited-list.component.html',
  styleUrls: ['./audited-list.component.less']
})
export class AuditedListComponent implements OnInit {
  auditedList: AuditedUser[];
  roleNames = ROLE_NAMES;

  constructor(private userService: UserService,
              private router: Router) {
    userService.getAuditedUsers().then(c => this.auditedList = c);
  }

  ngOnInit() {
  }

  transferCredit(auditedUser: AuditedUser) {
    this.router.navigate(['/user', 'transfer', auditedUser.address]);
  }
}
