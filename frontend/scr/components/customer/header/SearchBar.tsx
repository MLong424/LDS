// src/components/customer/header/SearchBar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookText, Music, Disc, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaType } from '@cusTypes/products';

interface SearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    showSuggestions: boolean;
    onShowSuggestionsChange: (show: boolean) => void;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    onSearchQueryChange,
    showSuggestions,
    onShowSuggestionsChange,
    className
}) => {
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?title=${encodeURIComponent(searchQuery)}`);
            onShowSuggestionsChange(false);
        }
    };

    const handleSearchItemClick = (mediaType?: MediaType) => {
        if (searchQuery.trim()) {
            let url = `/shop?title=${encodeURIComponent(searchQuery)}`;
            if (mediaType) {
                url += `&media_type=${mediaType}`;
            }
            navigate(url);
            onShowSuggestionsChange(false);
        }
    };

    const searchSuggestions = [
        { icon: <BookText className="h-4 w-4" />, type: 'BOOK' as MediaType, label: 'Search Books' },
        { icon: <Music className="h-4 w-4" />, type: 'LP_RECORD' as MediaType, label: 'Search LP Records' },
        { icon: <Disc className="h-4 w-4" />, type: 'CD' as MediaType, label: 'Search CDs' },
        { icon: <Film className="h-4 w-4" />, type: 'DVD' as MediaType, label: 'Search DVDs' },
    ];

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    onFocus={() => onShowSuggestionsChange(true)}
                    onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
                    className="pl-4 pr-12 h-10"
                />
                <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                    <div className="p-2">
                        <button
                            onClick={() => handleSearchItemClick()}
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Search "{searchQuery}" in all categories
                        </button>
                        <div className="border-t my-2" />
                        {searchSuggestions.map((suggestion) => (
                            <button
                                key={suggestion.type}
                                onClick={() => handleSearchItemClick(suggestion.type)}
                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                            >
                                {suggestion.icon}
                                {suggestion.label} for "{searchQuery}"
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};