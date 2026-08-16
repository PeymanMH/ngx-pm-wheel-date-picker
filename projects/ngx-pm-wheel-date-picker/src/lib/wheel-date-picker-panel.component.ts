import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  JALALI_MONTH_NAMES,
  JalaliDateTime,
  clampJalaliDay,
  daysInJalaliMonth,
} from './jalali-date-math';
import { WheelColumnComponent, WheelItem } from './wheel-column.component';

const HOUR_ITEMS: WheelItem[] = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}));

const MINUTE_ITEMS: WheelItem[] = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}));

/**
 * The pure visual part of the day/month/year (and optionally hour/minute)
 * wheels, with no FormControl involvement; used both inline and inside the
 * modal sheet.
 */
@Component({
  selector: 'wdp-wheel-date-picker-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WheelColumnComponent],
  styles: `
    .wdp-panel {
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 4px;
      border-radius: 10px;
      border: 1px solid var(--wdp-border-strong, #d0d7e2);
      background: var(--wdp-surface-1, #ffffff);
      padding: 4px 8px;
    }
    .wdp-col-day,
    .wdp-col-year,
    .wdp-col-hour,
    .wdp-col-minute {
      flex: 1 1 0%;
    }
    .wdp-col-month {
      flex: 1.4 1.4 0%;
    }
    .wdp-divider {
      width: 1px;
      align-self: stretch;
      background: var(--wdp-border, #e5e9ee);
    }
  `,
  template: `
    <div class="wdp-panel">
      <wdp-wheel-column
        class="wdp-col-day"
        ariaLabel="روز"
        [items]="dayItems()"
        [selected]="value().day"
        (selectedChange)="onDayChange($event)"
      />
      <div class="wdp-divider"></div>
      <wdp-wheel-column
        class="wdp-col-month"
        ariaLabel="ماه"
        [items]="monthItems"
        [selected]="value().month"
        (selectedChange)="onMonthChange($event)"
      />
      <div class="wdp-divider"></div>
      <wdp-wheel-column
        class="wdp-col-year"
        ariaLabel="سال"
        [items]="yearItems()"
        [selected]="value().year"
        (selectedChange)="onYearChange($event)"
      />
      @if (withTime()) {
        <div class="wdp-divider"></div>
        <wdp-wheel-column
          class="wdp-col-hour"
          ariaLabel="ساعت"
          [items]="hourItems"
          [selected]="value().hour"
          (selectedChange)="onHourChange($event)"
        />
        <div class="wdp-divider"></div>
        <wdp-wheel-column
          class="wdp-col-minute"
          ariaLabel="دقیقه"
          [items]="minuteItems"
          [selected]="value().minute"
          (selectedChange)="onMinuteChange($event)"
        />
      }
    </div>
  `,
})
export class WheelDatePickerPanelComponent {
  readonly value = input.required<JalaliDateTime>();
  readonly withTime = input(false);
  readonly minYear = input.required<number>();
  readonly maxYear = input.required<number>();
  readonly valueChange = output<JalaliDateTime>();

  protected readonly monthItems: WheelItem[] = JALALI_MONTH_NAMES.map((name, index) => ({
    value: index + 1,
    label: name,
  }));
  protected readonly hourItems = HOUR_ITEMS;
  protected readonly minuteItems = MINUTE_ITEMS;

  protected readonly dayItems = computed<WheelItem[]>(() => {
    const { year, month } = this.value();
    const count = daysInJalaliMonth(year, month);
    return Array.from({ length: count }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  });

  protected readonly yearItems = computed<WheelItem[]>(() => {
    const items: WheelItem[] = [];
    for (let year = this.minYear(); year <= this.maxYear(); year++) {
      items.push({ value: year, label: String(year) });
    }
    return items;
  });

  protected onDayChange(day: number): void {
    this.valueChange.emit({ ...this.value(), day });
  }

  protected onMonthChange(month: number): void {
    this.valueChange.emit(clampJalaliDay({ ...this.value(), month }));
  }

  protected onYearChange(year: number): void {
    this.valueChange.emit(clampJalaliDay({ ...this.value(), year }));
  }

  protected onHourChange(hour: number): void {
    this.valueChange.emit({ ...this.value(), hour });
  }

  protected onMinuteChange(minute: number): void {
    this.valueChange.emit({ ...this.value(), minute });
  }
}
