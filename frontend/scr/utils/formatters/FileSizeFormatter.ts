import { FileSizeFormattingStrategy } from './interfaces';

export class BinaryFileSizeFormattingStrategy implements FileSizeFormattingStrategy {
    format(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

export class DecimalFileSizeFormattingStrategy implements FileSizeFormattingStrategy {
    format(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

export class CompactFileSizeFormattingStrategy implements FileSizeFormattingStrategy {
    format(bytes: number, decimals: number = 1): string {
        if (bytes === 0) return '0B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    }
}

export class FileSizeFormatter {
    private static strategies: Map<string, FileSizeFormattingStrategy> = new Map([
        ['binary', new BinaryFileSizeFormattingStrategy()],
        ['decimal', new DecimalFileSizeFormattingStrategy()],
        ['compact', new CompactFileSizeFormattingStrategy()],
    ]);

    static registerStrategy(type: string, strategy: FileSizeFormattingStrategy): void {
        this.strategies.set(type, strategy);
    }

    static format(bytes: number, type: string = 'binary', decimals: number = 2): string {
        const strategy = this.strategies.get(type) || this.strategies.get('binary')!;
        return strategy.format(bytes, decimals);
    }
}