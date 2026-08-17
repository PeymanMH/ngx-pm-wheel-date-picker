import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { JalaliDateTime } from './jalali-date-math';
import { WheelDatePickerPanelComponent } from './wheel-date-picker-panel.component';

export interface WheelDatePickerSheetData {
  title: string;
  value: JalaliDateTime;
  withTime: boolean;
  minYear: number;
  maxYear: number;
}

/** The bottom-sheet/dialog content opened by `WheelDatePickerComponent` in `mode="modal"`. */
@Component({
  selector: 'wdp-wheel-date-picker-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WheelDatePickerPanelComponent],
  host: { class: 'wdp-sheet-host' },
  styles: `
    :host {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 50;
      display: block;
    }
    @media (min-width: 768px) {
      :host {
        position: relative;
        inset: auto;
        margin: auto;
      }
    }
    .wdp-sheet-panel {
      display: flex;
      max-height: 88dvh;
      width: 100%;
      max-width: 420px;
      flex-direction: column;
      border-radius: 16px 16px 0 0;
      border: 1px solid var(--wdp-border, #e5e9ee);
      background: var(--wdp-surface-2, #ffffff);
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    @media (min-width: 768px) {
      .wdp-sheet-panel {
        max-height: 85dvh;
        border-radius: 16px;
      }
      .wdp-sheet-drag-handle {
        display: none;
      }
    }
    .wdp-sheet-drag-handle {
      display: flex;
      justify-content: center;
      padding-top: 8px;
    }
    .wdp-sheet-drag-handle span {
      height: 6px;
      width: 40px;
      border-radius: 9999px;
      background: var(--wdp-border-strong, #d0d7e2);
    }
    .wdp-sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--wdp-border, #e5e9ee);
      padding: 12px 16px;
    }
    .wdp-sheet-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--wdp-text-primary, #0f172a);
      margin: 0;
    }
    .wdp-sheet-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 9999px;
      padding: 6px;
      color: var(--wdp-text-secondary, #55606f);
      cursor: pointer;
    }
    .wdp-sheet-close:hover {
      background: var(--wdp-surface-1, #ffffff);
    }
    .wdp-sheet-body {
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .wdp-sheet-confirm {
      height: 40px;
      width: 100%;
      border-radius: 10px;
      border: none;
      background: var(--wdp-accent, #0ea5e9);
      color: var(--wdp-accent-fg, #ffffff);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
    }
    .wdp-sheet-confirm:hover {
      opacity: 0.9;
    }
  `,
  template: `
    <div class="wdp-sheet-panel">
      <div class="wdp-sheet-drag-handle"><span></span></div>
      <div class="wdp-sheet-header">
        <h2 class="wdp-sheet-title">{{ data.title }}</h2>
        <button type="button" class="wdp-sheet-close" aria-label="بستن" (click)="dialogRef.close()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div class="wdp-sheet-body">
        <wdp-wheel-date-picker-panel
          [value]="value()"
          [withTime]="data.withTime"
          [minYear]="data.minYear"
          [maxYear]="data.maxYear"
          (valueChange)="value.set($event)"
        />
        <button type="button" class="wdp-sheet-confirm" (click)="confirm()">تأیید</button>
      </div>
    </div>
  `,
})
export class WheelDatePickerSheetComponent {
  protected readonly data = inject<WheelDatePickerSheetData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<JalaliDateTime>);

  protected readonly value = signal<JalaliDateTime>(this.data.value);

  protected confirm(): void {
    this.dialogRef.close(this.value());
  }
}
