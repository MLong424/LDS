// src/components/customer/header/useHeaderState.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useHeaderState = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const location = useLocation();

    // Track scroll for styling changes
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Clear search query when navigating away from shop
    useEffect(() => {
        if (!location.pathname.includes('/shop')) {
            setSearchQuery('');
        }
    }, [location.pathname]);

    return {
        searchQuery,
        setSearchQuery,
        isScrolled,
        showSearchSuggestions,
        setShowSearchSuggestions,
    };
};