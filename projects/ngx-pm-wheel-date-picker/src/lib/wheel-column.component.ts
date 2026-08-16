import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  input,
  output,
} from '@angular/core';

export interface WheelItem {
  value: number;
  label: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const SETTLE_DEBOUNCE_MS = 120;

/**
 * A scrollable column with scroll-snap where the centered value is treated as
 * selected. Independent of any date logic; works with numeric `value`/`label`
 * pairs so it's reusable for day, month, year, hour, or minute.
 */
@Component({
  selector: 'wdp-wheel-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .wdp-column-root {
      position: relative;
    }
    .wdp-column-highlight {
      pointer-events: none;
      position: absolute;
      inset-inline: 0;
      top: 50%;
      z-index: -1;
      transform: translateY(-50%);
      border-radius: 8px;
      background: var(--wdp-surface-0, #f4f6f8);
    }
    .wdp-column-scroller {
      height: 100%;
      scroll-snap-type: y mandatory;
      overflow-y: auto;
      outline: none;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .wdp-column-scroller::-webkit-scrollbar {
      display: none;
    }
    .wdp-column-item {
      display: flex;
      scroll-snap-align: center;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: color 150ms ease;
      cursor: pointer;
    }
    .wdp-column-item.selected {
      font-weight: 600;
      color: var(--wdp-text-primary, #0f172a);
    }
    .wdp-column-item:not(.selected) {
      color: var(--wdp-text-muted, #94a3b8);
    }
  `,
  template: `
    <div class="wdp-column-root" [style.height.px]="viewportHeight">
      <div class="wdp-column-highlight" [style.height.px]="itemHeight"></div>
      <div
        #scroller
        role="listbox"
        tabindex="0"
        [attr.aria-label]="ariaLabel()"
        class="wdp-column-scroller"
        (scroll)="onScroll()"
        (keydown)="onKeydown($event)"
      >
        <div [style.height.px]="paddingHeight"></div>
        @for (item of items(); track item.value) {
          <div
            role="option"
            [attr.aria-selected]="item.value === selected()"
            class="wdp-column-item"
            [class.selected]="item.value === selected()"
            [style.height.px]="itemHeight"
            (click)="selectValue(item.value)"
          >
            {{ item.label }}
          </div>
        }
        <div [style.height.px]="paddingHeight"></div>
      </div>
    </div>
  `,
})
export class WheelColumnComponent implements AfterViewInit, OnChanges {
  readonly items = input.required<WheelItem[]>();
  readonly selected = input.required<number>();
  readonly ariaLabel = input('');
  readonly selectedChange = output<number>();

  @ViewChild('scroller') private readonly scroller!: ElementRef<HTMLDivElement>;

  protected readonly itemHeight = ITEM_HEIGHT;
  protected readonly viewportHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  protected readonly paddingHeight = (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2;

  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressScrollEvents = false;

  ngAfterViewInit(): void {
    this.scrollToValue(this.selected(), 'auto');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && !changes['selected'].firstChange && this.scroller) {
      this.scrollToValue(this.selected(), 'smooth');
    }
  }

  protected onScroll(): void {
    if (this.suppressScrollEvents) return;
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.commitScrollPosition(), SETTLE_DEBOUNCE_MS);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    const index = items.findIndex((item) => item.value === this.selected());

    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.selectIndex(Math.max(0, index - 1));
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.selectIndex(Math.min(items.length - 1, index + 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.selectIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.selectIndex(items.length - 1);
    }
  }

  protected selectValue(value: number): void {
    this.scrollToValue(value, 'smooth');
    if (value !== this.selected()) {
      this.selectedChange.emit(value);
    }
  }

  private selectIndex(index: number): void {
    const item = this.items()[index];
    if (item) this.selectValue(item.value);
  }

  private commitScrollPosition(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const index = Math.round(el.scrollTop / this.itemHeight);
    const items = this.items();
    const clamped = Math.min(Math.max(index, 0), items.length - 1);
    const item = items[clamped];

    if (item && item.value !== this.selected()) {
      this.selectedChange.emit(item.value);
    }
  }

  private scrollToValue(value: number, behavior: ScrollBehavior): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const index = this.items().findIndex((item) => item.value === value);
    if (index < 0) return;

    this.suppressScrollEvents = true;
    el.scrollTo({ top: index * this.itemHeight, behavior });

    // Smooth scrolling takes a few frames; without this delay the scroll event
    // from this programmatic move would be misread as user interaction and
    // re-emitted.
    setTimeout(() => (this.suppressScrollEvents = false), behavior === 'smooth' ? 300 : 0);
  }
}
