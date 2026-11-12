import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra Home como link e os demais itens como "Em breve"', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('a.menu-item').length).toBe(1);
    expect(el.querySelectorAll('.menu-item.desabilitado').length).toBe(3);
    expect(el.querySelectorAll('.menu-item-tag').length).toBe(3);
  });
});
