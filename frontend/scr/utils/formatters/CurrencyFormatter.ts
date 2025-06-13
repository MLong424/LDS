import { CurrencyFormattingStrategy } from './interfaces';

export class VNDFormattingStrategy implements CurrencyFormattingStrategy {
    format(value: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}

export class USDFormattingStrategy implements CurrencyFormattingStrategy {
    format(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }
}

export class EURFormattingStrategy implements CurrencyFormattingStrategy {
    format(value: number): string {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }
}

export class GenericCurrencyFormattingStrategy implements CurrencyFormattingStrategy {
    constructor(private currency: string, private locale: string = 'en-US') {}

    format(value: number): string {
        return new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency: this.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }
}

export class CurrencyFormatter {
    private static strategies: Map<string, CurrencyFormattingStrategy> = new Map([
        ['VND', new VNDFormattingStrategy()],
        ['USD', new USDFormattingStrategy()],
        ['EUR', new EURFormattingStrategy()],
    ]);

    static registerStrategy(currency: string, strategy: CurrencyFormattingStrategy): void {
        this.strategies.set(currency, strategy);
    }

    static format(value: number, currency: string = 'VND'): string {
        const strategy = this.strategies.get(currency) || new GenericCurrencyFormattingStrategy(currency);
        return strategy.format(value);
    }

    static formatPrice(value: number, currency: string = 'VND'): string {
        return this.format(value, currency);
    }
}