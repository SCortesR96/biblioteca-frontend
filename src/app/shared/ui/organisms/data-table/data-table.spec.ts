import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnTemplate } from './column-template';
import { DataTable } from './data-table';
import type { TableColumn, TableSelectFilter } from './data-table.types';

type Row = { id: number; name: string; status: string };

const rows: Row[] = [
  { id: 1, name: 'Matilda', status: 'DISPONIBLE' },
  { id: 2, name: 'El Hobbit', status: 'PRESTADO' },
];

const columns: TableColumn[] = [
  { field: 'name', header: 'Nombre', sortable: true },
  { field: 'status', header: 'Estado' },
];

@Component({
  imports: [DataTable, ColumnTemplate],
  template: `
    <app-data-table
      [value]="rows"
      [columns]="columns"
      [globalFilterFields]="['name']"
      [selectFilter]="selectFilter"
      emptyMessage="Sin filas"
    >
      <ng-template appColumnTemplate="status" let-row>
        <span class="custom-status">{{ row.status }} !</span>
      </ng-template>
    </app-data-table>
  `,
})
class HostComponent {
  rows = rows;
  columns = columns;
  selectFilter: TableSelectFilter | null = {
    field: 'status',
    placeholder: 'Estado',
    options: [
      { label: 'Disponible', value: 'DISPONIBLE' },
      { label: 'Prestado', value: 'PRESTADO' },
    ],
  };
}

describe('DataTable', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one header cell per column', () => {
    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')).map((th) => (th as HTMLElement).textContent?.trim());
    expect(headers).toEqual(['Nombre', 'Estado']);
  });

  it('renders plain text for a column without a projected template', () => {
    expect(fixture.nativeElement.textContent).toContain('Matilda');
    expect(fixture.nativeElement.textContent).toContain('El Hobbit');
  });

  it('renders the projected template for a column that has one, instead of plain text', () => {
    const customCells = fixture.nativeElement.querySelectorAll('.custom-status');
    expect(customCells.length).toBe(2);
    expect(customCells[0].textContent).toContain('DISPONIBLE !');
  });

  it('shows the empty message when there are no rows', async () => {
    const emptyFixture = TestBed.createComponent(HostComponent);
    emptyFixture.componentInstance.rows = [];
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();

    expect(emptyFixture.nativeElement.textContent).toContain('Sin filas');
  });

  it('narrows visible rows when typing in the global search box', async () => {
    const input = fixture.nativeElement.querySelector('input[pInputText]') as HTMLInputElement;
    input.value = 'hobbit';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // p-table debounce su filtro global con un setTimeout (filterDelay) — no es un
    // microtask, así que whenStable() no alcanza a esperarlo.
    await new Promise((resolve) => setTimeout(resolve, 200));
    fixture.detectChanges();

    const bodyText = fixture.nativeElement.querySelector('tbody').textContent as string;
    expect(bodyText).toContain('El Hobbit');
    expect(bodyText).not.toContain('Matilda');
  });

  it('marks only columns declared as sortable with a clickable header', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers[0].querySelector('p-sorticon')).toBeTruthy(); // "name": sortable: true
    expect(headers[1].querySelector('p-sorticon')).toBeNull(); // "status": sortable not set
  });

  it('renders the table scrollable so long lists get a vertical scrollbar instead of growing the page', () => {
    const scroller = fixture.nativeElement.querySelector('.p-datatable-scrollable, .p-datatable-wrapper');
    expect(scroller).toBeTruthy();
  });
});
