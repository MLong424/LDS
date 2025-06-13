export interface FormattingStrategy<T = any> {
    format(value: T): string;
}

export interface CurrencyFormattingStrategy extends FormattingStrategy<number> {
    format(value: number): string;
}

export interface DateFormattingStrategy extends FormattingStrategy<string> {
    format(value: string, options?: Intl.DateTimeFormatOptions): string;
}

export interface FileSizeFormattingStrategy extends FormattingStrategy<number> {
    format(value: number, decimals?: number): string;
}

export interface PhoneFormattingStrategy extends FormattingStrategy<string> {
    format(value: string): string;
}

export interface TextFormattingStrategy {
    format(value: string, maxLength: number, suffix?: string): string;
}