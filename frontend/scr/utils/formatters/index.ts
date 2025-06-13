export * from './interfaces';

export * from './CurrencyFormatter';
export * from './DateFormatter';
export * from './FileSizeFormatter';
export * from './PhoneFormatter';
export * from './TextFormatter';

import { CurrencyFormatter } from './CurrencyFormatter';
import { DateFormatter } from './DateFormatter';
import { FileSizeFormatter } from './FileSizeFormatter';
import { PhoneFormatter } from './PhoneFormatter';
import { TextFormatter } from './TextFormatter';

export const formatPrice = (price: number, currency = 'VND'): string => {
    return CurrencyFormatter.formatPrice(price, currency);
};

export const formatDate = (
    dateString: string,
    type: string = 'standard',
    options?: Intl.DateTimeFormatOptions
): string => {
    return DateFormatter.format(dateString, type, options);
};

export const formatFileSize = (bytes: number, type: string = 'binary', decimals = 2): string => {
    return FileSizeFormatter.format(bytes, type, decimals);
};

export const formatPhoneNumber = (phone: string, country: string = 'US'): string => {
    return PhoneFormatter.format(phone, country);
};

export const truncateText = (
    text: string, 
    maxLength: number, 
    type: string = 'standard', 
    suffix = '...'
): string => {
    return TextFormatter.truncate(text, maxLength, type, suffix);
};

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    return CurrencyFormatter.format(amount, currency);
};