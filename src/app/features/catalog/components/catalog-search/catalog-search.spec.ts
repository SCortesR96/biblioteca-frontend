import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { BookSearchParams } from '../../../../core/services/book.types';
import { CatalogSearch } from './catalog-search';

describe('CatalogSearch', () => {
  let fixture: ComponentFixture<CatalogSearch>;
  let component: CatalogSearch;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CatalogSearch] }).compileComponents();
    fixture = TestBed.createComponent(CatalogSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('emits trimmed, undefined-for-empty search params on submit', () => {
    const emitted: BookSearchParams[] = [];
    component.search.subscribe((params) => emitted.push(params));

    component['form'].setValue({ title: '  Matilda  ', author: '', status: null });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(emitted).toEqual([{ title: 'Matilda', author: undefined, status: undefined }]);
  });

  it('includes the selected status when set', () => {
    const emitted: BookSearchParams[] = [];
    component.search.subscribe((params) => emitted.push(params));

    component['form'].setValue({ title: '', author: '', status: 'DISPONIBLE' });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(emitted[0].status).toBe('DISPONIBLE');
  });

  it('emits automatically (debounced) when a field changes, without needing submit', async () => {
    const emitted: BookSearchParams[] = [];
    component.search.subscribe((params) => emitted.push(params));

    component['form'].controls.title.setValue('Hobbit');
    expect(emitted).toEqual([]); // todavía no, está debounced

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(emitted).toEqual([{ title: 'Hobbit', author: undefined, status: undefined }]);
  });
});
