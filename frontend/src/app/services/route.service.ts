import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {IBreadcrumb} from '../models/breadcrumb.model';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

function isBreadcurmb(crumb: IBreadcrumb | null): crumb is IBreadcrumb {
  return crumb !== null && Boolean(crumb.label);
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private crumbs = [] as (IBreadcrumb | null)[];
  breadcrumbs = new BehaviorSubject([] as IBreadcrumb[]);
  breadCrumbObservers = [] as Subscription[];

  actionComponent = new BehaviorSubject(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.getBreadcrumbs(this.route.root, '', 0);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const root = this.route.root;
      this.breadCrumbObservers.forEach(observer => observer.unsubscribe());
      this.crumbs = [];
      this.breadCrumbObservers = [];
      this.getBreadcrumbs(root, '', 0);
      this.breadcrumbs.next(this.crumbs.filter<IBreadcrumb>(isBreadcurmb));
    });
    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(event => {
      this.actionComponent.next(null);
    });
  }

  private getBreadcrumbs(route: ActivatedRoute | null, url: string, index: number) {
    if (route === null || !route.snapshot) {
      return;
    }
    const additionUrl = route.snapshot.url.map(segment => segment.path).join('/');
    url = `${url}${additionUrl ? `/${additionUrl}` : ''}`;
    this.breadCrumbObservers[index] = route.data.subscribe(data => {
      if (data && data.breadcrumb) {
        this.crumbs[index] = {
          label: data.breadcrumb,
          url,
          query: route.firstChild === null ? route.snapshot.queryParams : {}
        };
        this.breadcrumbs.next(this.crumbs.filter(isBreadcurmb));
      } else {
        this.crumbs[index] = null;
      }
    });
    this.getBreadcrumbs(route.firstChild, url, index + 1);
  }
}
