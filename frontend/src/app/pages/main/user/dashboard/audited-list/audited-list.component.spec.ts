import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditedListComponent } from './audited-list.component';

describe('AuditedListComponent', () => {
  let component: AuditedListComponent;
  let fixture: ComponentFixture<AuditedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
