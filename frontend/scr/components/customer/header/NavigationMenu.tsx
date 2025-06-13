// src/components/customer/header/NavigationMenu.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookText, Music, Disc, Film } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@utils/utils';
import { MediaType } from '@cusTypes/products';

interface MediaCategory {
    icon: React.ReactNode;
    type: MediaType;
    title: string;
    description: string;
    subcategories: string[];
}

interface NavigationMenuMainProps {
    className?: string;
}

export const NavigationMenuMain: React.FC<NavigationMenuMainProps> = ({ className }) => {
    const navigate = useNavigate();

    const mediaCategories: MediaCategory[] = [
        {
            icon: <BookText className="h-5 w-5 mr-2" />,
            type: 'BOOK',
            title: 'Books',
            description: 'Browse our extensive collection of books',
            subcategories: ['Fiction', 'Non-Fiction', 'Children', 'Textbooks', 'Comics', 'Poetry', 'Self Help'],
        },
        {
            icon: <Music className="h-5 w-5 mr-2" />,
            type: 'LP_RECORD',
            title: 'LP Records',
            description: 'Discover our vinyl collection',
            subcategories: ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Country', 'Electronic'],
        },
        {
            icon: <Disc className="h-5 w-5 mr-2" />,
            type: 'CD',
            title: 'CDs',
            description: 'Explore our CD music selection',
            subcategories: ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Country', 'Soundtracks'],
        },
        {
            icon: <Film className="h-5 w-5 mr-2" />,
            type: 'DVD',
            title: 'DVDs',
            description: 'Check out our movie collection',
            subcategories: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Documentary', 'TV Series'],
        },
    ];

    const handleCategoryClick = (mediaType: MediaType, genre?: string) => {
        let url = `/shop?media_type=${mediaType}`;
        if (genre) {
            url += `&genre=${encodeURIComponent(genre)}`;
        }
        navigate(url);
    };

    return (
        <NavigationMenu className={className}>
            <NavigationMenuList>
                {/* Shop with Mega Menu */}
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid gap-6 p-6 md:w-[600px] lg:w-[800px] lg:grid-cols-[.75fr_1fr]">
                            <div className="row-span-3">
                                <Link
                                    to="/shop"
                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                >
                                    <div className="mb-2 mt-4 text-lg font-medium">
                                        All Products
                                    </div>
                                    <p className="text-sm leading-tight text-muted-foreground">
                                        Discover our complete collection of books, music, and movies.
                                    </p>
                                </Link>
                            </div>
                            <div className="grid gap-3">
                                {mediaCategories.map((category) => (
                                    <div key={category.type} className="border rounded-lg p-4">
                                        <button
                                            onClick={() => handleCategoryClick(category.type)}
                                            className="flex items-center w-full text-left hover:text-primary transition-colors"
                                        >
                                            {category.icon}
                                            <div>
                                                <div className="text-sm font-medium">{category.title}</div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {category.description}
                                                </p>
                                            </div>
                                        </button>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {category.subcategories.slice(0, 4).map((genre) => (
                                                <button
                                                    key={genre}
                                                    onClick={() => handleCategoryClick(category.type, genre)}
                                                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                {/* About */}
                <NavigationMenuItem>
                    <Link to="/about">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            About
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                {/* Contact */}
                <NavigationMenuItem>
                    <Link to="/contact">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Contact
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

// List Item component for reusable navigation links
const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";