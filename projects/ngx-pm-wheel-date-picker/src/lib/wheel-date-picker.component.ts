import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  JalaliDateTime,
  gregorianIsoToJalali,
  gregorianIsoToJalaliDateTime,
  jalaliDateTimeToGregorianIso,
  jalaliToGregorianIso,
  todayJalaliDateTime,
} from './jalali-date-math';
import { WheelDatePickerSheetComponent, WheelDatePickerSheetData } from './wheel-date-picker-sheet.component';
import { WheelDatePickerPanelComponent } from './wheel-date-picker-panel.component';

let uid = 0;

export type WheelDatePickerMode = 'modal' | 'inline';

/**
 * Wheel-style date picker on the Jalali (Persian/Shamsi) calendar.
 *
 * The `control` value is a Gregorian ISO string: `YYYY-MM-DD` when `withTime()`
 * is off, `YYYY-MM-DDTHH:mm:ss` when it's on.
 *
 * Default `mode` is `"modal"`: the field renders as an input-like trigger and
 * opens the wheels in a bottom sheet (via `@angular/cdk/dialog`) on click. Use
 * `mode="inline"` to render the wheels open, directly in the form.
 *
 * Theming is done entirely through CSS custom properties (see README) — no
 * required stylesheet import, no external icon font, no host app dependency.
 */
@Component({
  selector: 'wdp-wheel-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, WheelDatePickerPanelComponent],
  styles: `
    .wdp-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .wdp-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--wdp-text-secondary, #55606f);
    }
    .wdp-required {
      color: var(--wdp-danger, #dc2626);
    }
    .wdp-trigger {
      display: flex;
      height: 40px;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      border-radius: 10px;
      border: 1px solid var(--wdp-border-strong, #d0d7e2);
      background: var(--wdp-surface-1, #ffffff);
      padding: 0 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--wdp-text-primary, #0f172a);
      outline: none;
      cursor: pointer;
    }
    .wdp-trigger.invalid {
      border-color: var(--wdp-danger, #dc2626);
    }
    .wdp-trigger:focus-visible {
      border-color: var(--wdp-accent, #0ea5e9);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--wdp-accent, #0ea5e9) 20%, transparent);
    }
    .wdp-trigger-icon {
      color: var(--wdp-text-muted, #94a3b8);
      flex-shrink: 0;
    }
    .wdp-hint {
      font-size: 12px;
      color: var(--wdp-text-muted, #94a3b8);
      margin: 0;
    }
    .wdp-error {
      font-size: 12px;
      color: var(--wdp-danger, #dc2626);
      margin: 0;
    }
  `,
  template: `
    <div class="wdp-field">
      <label [for]="id" class="wdp-label">
        {{ label() }}
        @if (isRequired()) {
          <span class="wdp-required">*</span>
        }
      </label>

      @if (mode() === 'inline') {
        <wdp-wheel-date-picker-panel
          [value]="value()"
          [withTime]="withTime()"
          [minYear]="minYear()"
          [maxYear]="maxYear()"
          (valueChange)="commit($event)"
        />
      } @else {
        <button
          type="button"
          [id]="id"
          class="wdp-trigger"
          [class.invalid]="showInvalid()"
          (click)="openModal()"
        >
          <span>{{ displayText() }}</span>
          <svg class="wdp-trigger-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="5" width="16" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
          </svg>
        </button>
      }

      @if (showInvalid()) {
        <p class="wdp-error">تاریخ الزامی است</p>
      } @else if (hint()) {
        <p class="wdp-hint">{{ hint() }}</p>
      }
    </div>
  `,
})
export class WheelDatePickerComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly minYear = input<number>(todayJalaliDateTime().year - 100);
  readonly maxYear = input<number>(todayJalaliDateTime().year + 10);
  readonly mode = input<WheelDatePickerMode>('modal');
  readonly withTime = input(false);

  protected readonly id = `wdp-wheel-date-picker-${uid++}`;

  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);

  protected readonly value = signal<JalaliDateTime>(todayJalaliDateTime());

  constructor() {
    effect(() => {
      const ctrl = this.control();
      this.syncFromControlValue(ctrl.value);

      const subscription = ctrl.valueChanges.subscribe((raw) => this.syncFromControlValue(raw));
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }

  private syncFromControlValue(raw: string | null | undefined): void {
    if (!raw) {
      this.value.set(todayJalaliDateTime());
      return;
    }
    this.value.set(
      this.withTime() ? gregorianIsoToJalaliDateTime(raw) : { ...gregorianIsoToJalali(raw), hour: 0, minute: 0 },
    );
  }

  protected isRequired(): boolean {
    return this.control().hasValidator(Validators.required);
  }

  protected showInvalid(): boolean {
    return this.control().invalid && this.control().touched;
  }

  protected displayText(): string {
    const { year, month, day, hour, minute } = this.value();
    const pad = (n: number) => String(n).padStart(2, '0');
    const datePart = `${year}/${pad(month)}/${pad(day)}`;
    return this.withTime() ? `${datePart} ${pad(hour)}:${pad(minute)}` : datePart;
  }

  protected commit(date: JalaliDateTime): void {
    this.value.set(date);
    this.control().setValue(this.withTime() ? jalaliDateTimeToGregorianIso(date) : jalaliToGregorianIso(date));
    this.control().markAsTouched();
  }

  protected openModal(): void {
    this.dialog
      .open<JalaliDateTime, WheelDatePickerSheetData>(WheelDatePickerSheetComponent, {
        data: {
          title: this.label(),
          value: this.value(),
          withTime: this.withTime(),
          minYear: this.minYear(),
          maxYear: this.maxYear(),
        },
      })
      .closed.subscribe((result) => {
        if (result) this.commit(result);
      });
  }
}
