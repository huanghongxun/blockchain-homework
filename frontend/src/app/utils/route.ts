import {ActivatedRouteSnapshot} from '@angular/router';

export function getParam(route: ActivatedRouteSnapshot, paramKey: string) {
  while (!route.params[paramKey] && route.firstChild) { route = route.firstChild; }
  return route.params[paramKey];
}
