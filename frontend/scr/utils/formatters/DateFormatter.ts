import { DateFormattingStrategy } from './interfaces';

export class StandardDateFormattingStrategy implements DateFormattingStrategy {
    format(value: string, options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }): string {
        if (!value) return 'Not specified';

        try {
            const date = new Date(value);
            return new Intl.DateTimeFormat('en-US', options).format(date);
        } catch (e) {
            console.error('Invalid date format:', value);
            return 'Invalid date';
        }
    }
}

export class ShortDateFormattingStrategy implements DateFormattingStrategy {
    format(value: string): string {
        if (!value) return 'Not specified';

        try {
            const date = new Date(value);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).format(date);
        } catch (e) {
            console.error('Invalid date format:', value);
            return 'Invalid date';
        }
    }
}

export class TimeOnlyFormattingStrategy implements DateFormattingStrategy {
    format(value: string): string {
        if (!value) return 'Not specified';

        try {
            const date = new Date(value);
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }).format(date);
        } catch (e) {
            console.error('Invalid date format:', value);
            return 'Invalid time';
        }
    }
}

export class DateTimeFormattingStrategy implements DateFormattingStrategy {
    format(value: string): string {
        if (!value) return 'Not specified';

        try {
            const date = new Date(value);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }).format(date);
        } catch (e) {
            console.error('Invalid date format:', value);
            return 'Invalid date';
        }
    }
}

export class DateFormatter {
    private static strategies: Map<string, DateFormattingStrategy> = new Map([
        ['standard', new StandardDateFormattingStrategy()],
        ['short', new ShortDateFormattingStrategy()],
        ['time', new TimeOnlyFormattingStrategy()],
        ['datetime', new DateTimeFormattingStrategy()],
    ]);

    static registerStrategy(type: string, strategy: DateFormattingStrategy): void {
        this.strategies.set(type, strategy);
    }

    static format(
        value: string,
        type: string = 'standard',
        options?: Intl.DateTimeFormatOptions
    ): string {
        const strategy = this.strategies.get(type) || this.strategies.get('standard')!;
        return strategy.format(value, options);
    }
}