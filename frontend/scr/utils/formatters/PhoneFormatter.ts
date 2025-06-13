import { PhoneFormattingStrategy } from './interfaces';

export class USPhoneFormattingStrategy implements PhoneFormattingStrategy {
    format(phone: string): string {
        const phoneNumberDigits = phone.replace(/\D/g, '');

        if (phoneNumberDigits.length === 10) {
            return phoneNumberDigits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (phoneNumberDigits.length === 11 && phoneNumberDigits.startsWith('1')) {
            return phoneNumberDigits.replace(/1(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
        }

        return phone;
    }
}

export class InternationalPhoneFormattingStrategy implements PhoneFormattingStrategy {
    format(phone: string): string {
        const phoneNumberDigits = phone.replace(/\D/g, '');

        if (phoneNumberDigits.length > 10) {
            return `+${phoneNumberDigits}`;
        }

        return phone;
    }
}

export class VietnamPhoneFormattingStrategy implements PhoneFormattingStrategy {
    format(phone: string): string {
        const phoneNumberDigits = phone.replace(/\D/g, '');

        if (phoneNumberDigits.length === 10 && phoneNumberDigits.startsWith('0')) {
            return phoneNumberDigits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        } else if (phoneNumberDigits.length === 11 && phoneNumberDigits.startsWith('84')) {
            return phoneNumberDigits.replace(/84(\d{3})(\d{3})(\d{3})/, '+84 $1 $2 $3');
        }

        return phone;
    }
}

export class PhoneFormatter {
    private static strategies: Map<string, PhoneFormattingStrategy> = new Map([
        ['US', new USPhoneFormattingStrategy()],
        ['VN', new VietnamPhoneFormattingStrategy()],
        ['international', new InternationalPhoneFormattingStrategy()],
    ]);

    static registerStrategy(country: string, strategy: PhoneFormattingStrategy): void {
        this.strategies.set(country, strategy);
    }

    static format(phone: string, country: string = 'US'): string {
        const strategy = this.strategies.get(country) || this.strategies.get('US')!;
        return strategy.format(phone);
    }
}