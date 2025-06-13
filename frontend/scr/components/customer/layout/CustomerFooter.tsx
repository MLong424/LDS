// src/components/customer/footer/CustomerFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, BookOpen } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Separator } from '@/components/ui/separator';

const CustomerFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Newsletter subscription logic would go here
    };

    return (
        <footer className="bg-background border-t">
            <div className="container py-8 md:py-12 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6" />
                            <span className="font-bold text-xl">Mediastore</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your one-stop shop for books, music, and movies. We offer a wide selection of media products
                            with convenient delivery options.
                        </p>
                        <div className="flex space-x-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Facebook className="h-4 w-4" />
                                <span className="sr-only">Facebook</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Twitter className="h-4 w-4" />
                                <span className="sr-only">Twitter</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Instagram className="h-4 w-4" />
                                <span className="sr-only">Instagram</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Youtube className="h-4 w-4" />
                                <span className="sr-only">YouTube</span>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/shop"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    123 Media Street, Book City, 12345
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">info@mediastore.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to our newsletter for the latest products and exclusive offers.
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                            <div className="flex">
                                <Input type="email" placeholder="Your email" className="rounded-r-none" required />
                                <Button type="submit" className="rounded-l-none">
                                    Subscribe
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </form>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Copyright & Payment Methods */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                        © {currentYear} Mediastore. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-12 bg-muted rounded-md flex items-center justify-center text-xs">
                            VISA
                        </div>
                        <div className="h-8 w-12 bg-muted rounded-md flex items-center justify-center text-xs">MC</div>
                        <div className="h-8 w-12 bg-muted rounded-md flex items-center justify-center text-xs">
                            AMEX
                        </div>
                        <div className="h-8 w-12 bg-muted rounded-md flex items-center justify-center text-xs">
                            PAYPAL
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default CustomerFooter;