import dayjsBase from 'dayjs';
import jalaliday from 'jalaliday';

// Self-contained on purpose: this folder should be copy-pasteable into another
// project as-is. Extending the same dayjs plugin twice (the app's own
// core/date/dayjs-setup.ts also does this) is a harmless no-op, so there is no
// coupling to that file.
dayjsBase.extend(jalaliday);

const dayjs = dayjsBase as unknown as (...args: unknown[]) => any;

export interface JalaliDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface JalaliDateTime extends JalaliDate {
  hour: number; // 0-23
  minute: number; // 0-59
}

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** امروز را به تاریخ جلالی برمی‌گرداند. */
export function todayJalali(): JalaliDate {
  return gregorianIsoToJalali(new Date().toISOString());
}

/** امروز/الان را به تاریخ‌وساعت جلالی برمی‌گرداند. */
export function todayJalaliDateTime(): JalaliDateTime {
  return gregorianIsoToJalaliDateTime(new Date().toISOString());
}

/** یک رشته‌ی ISO میلادی (یا هر ورودی قابل‌فهم dayjs) را به تاریخ جلالی تبدیل می‌کند. */
export function gregorianIsoToJalali(iso: string): JalaliDate {
  const d = dayjs(iso).calendar('jalali');
  return { year: d.year(), month: d.month() + 1, day: d.date() };
}

/** یک رشته‌ی ISO میلادی را به تاریخ‌وساعت جلالی تبدیل می‌کند. */
export function gregorianIsoToJalaliDateTime(iso: string): JalaliDateTime {
  const d = dayjs(iso).calendar('jalali');
  return { year: d.year(), month: d.month() + 1, day: d.date(), hour: d.hour(), minute: d.minute() };
}

/**
 * تاریخ جلالی را به رشته‌ی تاریخ‌ِ-تنهای ISO میلادی (YYYY-MM-DD) تبدیل می‌کند.
 * عمداً از `.toISOString()` استفاده نمی‌کند: آن متد به وقت UTC تبدیل می‌کند و در
 * منطقه‌های زمانی با آفست منفی می‌تواند یک روز عقب بیفتد.
 */
export function jalaliToGregorianIso(date: JalaliDate): string {
  return dayjs().calendar('jalali').year(date.year).month(date.month - 1).date(date.day).calendar('gregory').format('YYYY-MM-DD');
}

/** تاریخ‌وساعت جلالی را به رشته‌ی ISO میلادی با ساعت (YYYY-MM-DDTHH:mm:ss) تبدیل می‌کند. */
export function jalaliDateTimeToGregorianIso(date: JalaliDateTime): string {
  return dayjs()
    .calendar('jalali')
    .year(date.year)
    .month(date.month - 1)
    .date(date.day)
    .hour(date.hour)
    .minute(date.minute)
    .second(0)
    .calendar('gregory')
    .format('YYYY-MM-DDTHH:mm:ss');
}

/** تعداد روزهای یک ماه جلالی مشخص را برمی‌گرداند (کبیسه را هم درست حساب می‌کند). */
export function daysInJalaliMonth(year: number, month: number): number {
  return dayjs()
    .calendar('jalali')
    .year(year)
    .month(month - 1)
    .date(1)
    .endOf('month')
    .date();
}

/** روز را در بازه‌ی مجاز همان ماه نگه می‌دارد؛ برای وقتی که تغییر ماه/سال روز فعلی را نامعتبر می‌کند. */
export function clampJalaliDay<T extends JalaliDate>(date: T): T {
  const maxDay = daysInJalaliMonth(date.year, date.month);
  return date.day > maxDay ? { ...date, day: maxDay } : date;
}
