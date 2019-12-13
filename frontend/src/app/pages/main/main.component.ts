import {AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {UserService} from '../../services/user.service';
import {IBreadcrumb} from '../../models/breadcrumb.model';
import {RouteService} from '../../services/route.service';
import {PrivateKeyService} from '../../services/private-key.service';

export interface BreadCrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit, AfterViewInit {
  breadcrumbs: IBreadcrumb[] = [];
  template;

  isVisible: boolean;
  callback: () => void;
  privateKey: string;

  constructor(
    private userService: UserService,
    private routeService: RouteService,
    private privateKeyService: PrivateKeyService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    routeService.breadcrumbs.subscribe(breadcrumbs => this.breadcrumbs = breadcrumbs);

    privateKeyService.request.subscribe(request => {
      if (!request) { return; }
      this.isVisible = true;
      this.callback = request.callback;
    });
  }

  ngOnInit(): void {
    this.routeService.actionComponent.subscribe(component => {
      this.template = component;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
  }

  acceptTransaction() {
    this.privateKeyService.lastPrivateKey = this.privateKey;
    this.callback();
    this.isVisible = false;
  }
}
