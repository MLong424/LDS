// src/pages/client/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '@/components/customer/home/HeroCarousel';
import FeaturedProducts from '@/components/customer/home/FeaturedProducts';
import { BookText, Disc, Film, Music, TruckIcon, ShieldCheck, CreditCard, Clock } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const Home: React.FC = () => {
    // Sample carousel items
    const carouselItems = [
        {
            id: '1',
            title: 'Discover Your Next Favorite Book',
            description: 'Explore our vast collection of bestsellers, classics, and hidden gems.',
            buttonText: 'Shop Books',
            buttonLink: '/shop?media_type=BOOK',
            bgColor: 'hsl(var(--primary) / 0.1)',
        },
        {
            id: '2',
            title: 'New Vinyl Records In Stock',
            description: 'Get the authentic sound experience with our premium vinyl collection.',
            buttonText: 'Shop Records',
            buttonLink: '/shop?media_type=LP_RECORD',
            bgColor: 'hsl(var(--secondary) / 0.15)',
        }
    ];

    // Categories for quick navigation
    const categories = [
        { name: 'Books', icon: <BookText className="h-8 w-8" />, link: '/shop?media_type=BOOK' },
        { name: 'CDs', icon: <Disc className="h-8 w-8" />, link: '/shop?media_type=CD' },
        { name: 'DVDs', icon: <Film className="h-8 w-8" />, link: '/shop?media_type=DVD' },
        { name: 'Vinyl Records', icon: <Music className="h-8 w-8" />, link: '/shop?media_type=LP_RECORD' },
    ];

    // Store features
    const features = [
        {
            icon: <TruckIcon className="h-10 w-10" />,
            title: 'Fast Delivery',
            description: 'Get your order within 48 hours',
        },
        {
            icon: <ShieldCheck className="h-10 w-10" />,
            title: 'Secure Payments',
            description: 'Multiple payment options',
        },
        { icon: <CreditCard className="h-10 w-10" />, title: 'Easy Returns', description: '30-day return policy' },
        { icon: <Clock className="h-10 w-10" />, title: '24/7 Support', description: 'Always here to help you' },
    ];

    return (
        <div className="space-y-12">
            {/* Hero Carousel */}
            <section>
                <HeroCarousel items={carouselItems} />
            </section>

            {/* Category Navigation */}
            <section className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <Link to={category.link}>
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    {category.icon}
                                    <h3 className="mt-4 font-medium">{category.name}</h3>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section>
                <FeaturedProducts />
            </section>

            {/* Store Features */}
            <section className="py-10 bg-muted/50">
                <div className="container">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Choose Us</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-none bg-transparent">
                                <CardContent className="flex flex-col items-center text-center p-6">
                                    <div className="text-primary mb-4">{feature.icon}</div>
                                    <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-12 bg-primary/10 rounded-lg">
                <div className="container text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Join Our Newsletter</h2>
                    <p className="text-muted-foreground mb-6">
                        Stay updated with the latest releases and exclusive offers.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                        <Button type="submit">Subscribe</Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-4">
                        By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                    </p>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Explore?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Browse our full collection of books, music, and movies to find your perfect match.
                </p>
                <Button asChild size="lg">
                    <Link to="/shop">Shop All Products</Link>
                </Button>
            </section>
        </div>
    );
};