import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import type { ReservationItem } from '../../../../core/services/reservation.types';
import { Button } from '../../../../shared/ui/atoms/button/button';

@Component({
  selector: 'app-reservations-table',
  imports: [TableModule, Tag, Button, DatePipe],
  templateUrl: './reservations-table.html',
  styleUrl: './reservations-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsTable {
  readonly reservations = input.required<ReservationItem[]>();
  readonly loading = input(false);

  readonly cancelReservation = output<ReservationItem>();

  protected trackById(_index: number, reservation: ReservationItem): number {
    return reservation.id;
  }
}
