import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RouteService} from '../../services/route.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less']
})
export class ActionComponent implements OnInit, AfterViewInit {

  @ViewChild('action', {static: false}) action;

  constructor(private route: ActivatedRoute,
              private routeService: RouteService) { }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.routeService.actionComponent.next(this.action);
    });
  }

  ngAfterViewInit(): void {
    this.routeService.actionComponent.next(this.action);
  }

}
