import { TextFormattingStrategy } from './interfaces';

export class StandardTruncationStrategy implements TextFormattingStrategy {
    format(text: string, maxLength: number, suffix: string = '...'): string {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + suffix;
    }
}

export class WordBoundaryTruncationStrategy implements TextFormattingStrategy {
    format(text: string, maxLength: number, suffix: string = '...'): string {
        if (!text || text.length <= maxLength) return text;
        
        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > 0) {
            return truncated.substring(0, lastSpace).trim() + suffix;
        }
        
        return truncated.trim() + suffix;
    }
}

export class EllipsisMiddleTruncationStrategy implements TextFormattingStrategy {
    format(text: string, maxLength: number, suffix: string = '...'): string {
        if (!text || text.length <= maxLength) return text;
        
        const charsToShow = maxLength - suffix.length;
        const frontChars = Math.ceil(charsToShow / 2);
        const backChars = Math.floor(charsToShow / 2);
        
        return text.substring(0, frontChars) + suffix + text.substring(text.length - backChars);
    }
}

export class TextFormatter {
    private static strategies: Map<string, TextFormattingStrategy> = new Map([
        ['standard', new StandardTruncationStrategy()],
        ['word-boundary', new WordBoundaryTruncationStrategy()],
        ['ellipsis-middle', new EllipsisMiddleTruncationStrategy()],
    ]);

    static registerStrategy(type: string, strategy: TextFormattingStrategy): void {
        this.strategies.set(type, strategy);
    }

    static truncate(
        text: string, 
        maxLength: number, 
        type: string = 'standard', 
        suffix: string = '...'
    ): string {
        const strategy = this.strategies.get(type) || this.strategies.get('standard')!;
        return strategy.format(text, maxLength, suffix);
    }

    static capitalize(text: string): string {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    static titleCase(text: string): string {
        if (!text) return text;
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
    }

    static camelCase(text: string): string {
        if (!text) return text;
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    static kebabCase(text: string): string {
        if (!text) return text;
        return text
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
}