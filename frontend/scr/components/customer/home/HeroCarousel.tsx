// src/components/home/HeroCarousel.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@utils/utils';

interface CarouselItem {
    id: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image?: string; // Optional image URL
    bgColor?: string; // Optional background color
}

interface HeroCarouselProps {
    items: CarouselItem[];
    autoPlay?: boolean;
    interval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, autoPlay = true, interval = 5000 }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-play effect
    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % items.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, items.length]);

    const goToSlide = (index: number) => {
        setActiveIndex(index);
    };

    const goToPrevSlide = () => {
        setActiveIndex((current) => (current - 1 + items.length) % items.length);
    };

    const goToNextSlide = () => {
        setActiveIndex((current) => (current + 1) % items.length);
    };

    // If there are no items, don't render
    if (!items.length) return null;

    return (
        <div className="relative w-full overflow-hidden rounded-lg max-w-5xl mx-auto">
            {/* Carousel Items */}
            <div className="relative h-[400px] md:h-[500px]">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            'absolute inset-0 flex flex-col md:flex-row items-center justify-center p-8 transition-opacity duration-500',
                            {
                                'opacity-100 z-10': index === activeIndex,
                                'opacity-0 z-0': index !== activeIndex,
                            }
                        )}
                        style={{
                            backgroundColor: item.bgColor || 'hsl(var(--primary) / 0.1)',
                        }}
                    >
                        <div className="md:w-1/2 text-center mb-6 md:mb-0 max-w-md mx-auto">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{item.title}</h2>
                            <p className="text-muted-foreground mb-6">{item.description}</p>
                            <Button asChild size="lg">
                                <Link to={item.buttonLink}>{item.buttonText}</Link>
                            </Button>
                        </div>
                        {item.image && (
                            <div className="md:w-1/2 flex justify-center">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="max-h-[200px] md:max-h-[300px] w-auto object-contain"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full bg-background/80"
                onClick={goToPrevSlide}
            >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous slide</span>
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full bg-background/80"
                onClick={goToNextSlide}
            >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next slide</span>
            </Button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={cn('w-3 h-3 rounded-full transition-colors', {
                            'bg-primary': index === activeIndex,
                            'bg-muted': index !== activeIndex,
                        })}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;