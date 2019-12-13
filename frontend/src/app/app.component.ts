import {Component, OnInit} from '@angular/core';
import {UserService} from './services/user.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  showFooterNav = true;
  loading = false;

  constructor(private router: Router,
              private userService: UserService) {
    this.router.events.subscribe(event => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // 检查 URL 是否不是 '/'，若是 '/'，则为主页，不显示 footer
        // this.showFooterNav = event.url.length > 1;
      }
    });
  }

  navigateToUserProfile() {
    this.router.navigate(['/user', 'dashboard']);
  }
}
