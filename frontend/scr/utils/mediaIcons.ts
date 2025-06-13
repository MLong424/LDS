// src/utils/mediaIcons.ts
import React from 'react';
import { BookText, Disc, Film, Music } from 'lucide-react';
import { MediaType } from '@cusTypes/products';

export const getMediaIcon = (mediaType: MediaType) => {
    switch (mediaType) {
        case 'BOOK':
            return React.createElement(BookText);
        case 'CD':
            return React.createElement(Disc);
        case 'DVD':
            return React.createElement(Film);
        case 'LP_RECORD':
            return React.createElement(Music);
        default:
            return React.createElement(BookText);
    }
};