import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WheelDatePickerComponent } from 'ngx-pm-wheel-date-picker';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WheelDatePickerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly dark = signal(false);

  protected readonly modalDate = new FormControl('', { nonNullable: true });
  protected readonly modalDateTime = new FormControl('', { nonNullable: true });
  protected readonly inlineDate = new FormControl('', { nonNullable: true });
  protected readonly inlineDateTime = new FormControl('', { nonNullable: true, validators: [] });

  protected toggleTheme(): void {
    this.dark.update((value) => !value);
    document.documentElement.setAttribute('data-theme', this.dark() ? 'dark' : 'light');
  }
}
