# ngx-pm-wheel-date-picker

[![npm version](https://img.shields.io/npm/v/ngx-pm-wheel-date-picker.svg)](https://www.npmjs.com/package/ngx-pm-wheel-date-picker)
[![license](https://img.shields.io/npm/l/ngx-pm-wheel-date-picker.svg)](./LICENSE)

A standalone wheel-style date/time picker for Angular, on the **Jalali (Persian/Shamsi) calendar**.
Inline or modal (bottom-sheet) mode, optional time selection, leap years handled correctly,
themeable via CSS custom properties. No required stylesheet import, no icon font, no dependency
on any particular design system — it works next to Tailwind, Material, or plain CSS alike.

▶ [Try it on StackBlitz](https://stackblitz.com/github/PeymanMH/ngx-pm-wheel-date-picker?file=projects/demo/src/app/app.html)

## Features

- 📅 Full Jalali calendar math (via [`dayjs`](https://day.js.org/) + [`jalaliday`](https://github.com/kalimahapps/jalaliday)), leap years included
- 🎡 Wheel-style scroll-snap picker for day / month / year, and optionally hour / minute
- 🪟 Two modes: `inline` (always open) or `modal` (input-like trigger, opens a CDK-dialog bottom sheet)
- 🌗 Light/dark theming through CSS custom properties, with sensible fallback values
- 🈂️ RTL-friendly — inherits `direction` from the document, same as the rest of your app
- 📦 Angular Package Format build (works with any Angular ≥ 21 app), zero required global stylesheet
  beyond the standard `@angular/cdk` overlay CSS

## Install

```bash
npm install ngx-pm-wheel-date-picker dayjs jalaliday
```

See [`projects/ngx-pm-wheel-date-picker/README.md`](./projects/ngx-pm-wheel-date-picker/README.md)
(also published to npm alongside the package) for full usage, the inputs table, and the CSS
variables reference.

## Quick example

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

## Repository layout

This is an Angular CLI workspace with two projects:

```
projects/
  ngx-pm-wheel-date-picker/   the publishable library (this is what ships to npm)
  demo/                       a small showcase app — also what StackBlitz opens
```

## Running the demo locally

```bash
npm install
npm run build:lib     # builds the library into dist/ngx-pm-wheel-date-picker once
npm run start:demo    # serves the demo app at http://localhost:4300
```

The demo app resolves `ngx-pm-wheel-date-picker` from `dist/` via a TypeScript path mapping
(`tsconfig.json`), the same way any consumer would resolve it from `node_modules` — so `build:lib`
must run at least once before `start:demo` picks up the library.

## Building and publishing the package

```bash
npm run build:lib
cd dist/ngx-pm-wheel-date-picker
npm publish --access public
```

`npm run pack:lib` builds and produces a local `.tgz` tarball (via `npm pack`) if you want to
inspect or install it locally before publishing.

## License

MIT — see [LICENSE](./LICENSE).
