import { Component, OnInit } from '@angular/core';
import {ProfileResponse} from '../../../../models/user.model';
import {UserService} from '../../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  user: ProfileResponse;

  constructor(private userService: UserService) {
    this.userService.getUserProfile()
      .then(profile => this.user = profile)
      .catch(err => {
        console.log(err);
      });
  }

  ngOnInit() {
  }
}
