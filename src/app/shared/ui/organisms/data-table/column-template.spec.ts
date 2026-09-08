import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnTemplate } from './column-template';

@Component({
  imports: [ColumnTemplate],
  template: `<ng-template appColumnTemplate="status" #tpl let-row>{{ row }}</ng-template>`,
})
class HostComponent {
  readonly directive = viewChild.required(ColumnTemplate);
}

describe('ColumnTemplate', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('exposes the field it was declared with', () => {
    expect(fixture.componentInstance.directive().field()).toBe('status');
  });

  it('exposes the underlying TemplateRef', () => {
    expect(fixture.componentInstance.directive().templateRef).toBeTruthy();
  });
});
