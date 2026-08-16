# ngx-pm-wheel-date-picker

A standalone wheel-style date/time picker for Angular, on the Jalali (Persian/Shamsi) calendar.
Inline or modal (bottom-sheet) mode, optional time selection, leap years handled correctly,
themeable via CSS custom properties. No required stylesheet import, no icon font.

## Install

```bash
npm install ngx-pm-wheel-date-picker dayjs jalaliday
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/cdk` (v21+).

`mode="modal"` (the default) opens the picker with `@angular/cdk/dialog`, which needs the CDK
overlay styles loaded once, globally, in your app:

```json
// angular.json — architect.build.options.styles
"node_modules/@angular/cdk/overlay-prebuilt.css"
```

## Usage

```ts
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WheelDatePickerComponent } from 'ngx-pm-wheel-date-picker';

@Component({
  standalone: true,
  imports: [WheelDatePickerComponent],
  template: `<wdp-wheel-date-picker [control]="birthDate" label="تاریخ تولد" />`,
})
export class ExampleComponent {
  birthDate = new FormControl('', { nonNullable: true });
}
```

### Inputs

| Input      | Type                    | Default   | Notes                                                              |
| ---------- | ----------------------- | --------- | -------------------------------------------------------------------- |
| `control`  | `FormControl<string>`   | required  | Gregorian ISO value: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm:ss` if `withTime` |
| `label`    | `string`                | required  | Field label                                                          |
| `hint`     | `string \| null`        | `null`    | Helper text shown under the field when there's no validation error   |
| `mode`     | `'modal' \| 'inline'`   | `'modal'` | `modal` renders an input-like trigger; `inline` renders the wheels open |
| `withTime` | `boolean`               | `false`   | Adds hour/minute wheels and switches the control value to a full ISO datetime |
| `minYear`  | `number`                | today − 100 | Lower bound of the year wheel                                     |
| `maxYear`  | `number`                | today + 10  | Upper bound of the year wheel                                     |

## Theming

Every color is a CSS custom property with a sensible light-mode fallback, so the component works
out of the box. Override any of these — on `:root`, on a `[data-theme="dark"]` selector, or
however your app switches themes — to match your design system:

```css
:root {
  --wdp-surface-0: #f4f6f8; /* wheel highlight band */
  --wdp-surface-1: #ffffff; /* field/panel background */
  --wdp-surface-2: #ffffff; /* modal sheet background */
  --wdp-text-primary: #0f172a;
  --wdp-text-secondary: #55606f;
  --wdp-text-muted: #94a3b8;
  --wdp-border: #e5e9ee;
  --wdp-border-strong: #d0d7e2;
  --wdp-accent: #0ea5e9;
  --wdp-accent-fg: #ffffff;
  --wdp-danger: #dc2626;
}

[data-theme='dark'] {
  --wdp-surface-0: #0b0f14;
  --wdp-surface-1: #121821;
  --wdp-surface-2: #182130;
  --wdp-text-primary: #f1f5f9;
  --wdp-text-secondary: #a3b0c2;
  --wdp-text-muted: #64748b;
  --wdp-border: #232c3a;
  --wdp-border-strong: #2f3a4c;
}
```

If your app already has its own design tokens, just alias them instead of duplicating values:

```css
:root {
  --wdp-surface-1: var(--your-surface-color);
  --wdp-text-primary: var(--your-text-color);
  /* ... */
}
```

## RTL

The component doesn't force text direction — it inherits `direction` from the document, same as
any other element. Set `dir="rtl"` on `<html>` (or wherever your app already does it) for a
right-to-left layout.
