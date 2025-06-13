// src/pages/client/About/About.tsx
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, TruckIcon, Map, Globe } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    avatar: string;
}

interface Milestone {
    year: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export const About: React.FC = () => {
    // Sample team members data
    const teamMembers: TeamMember[] = [
        {
            name: 'Jane Smith',
            role: 'Founder & CEO',
            bio: 'Jane has 15+ years of experience in the publishing industry and founded Mediastore to connect people with physical media in the digital age.',
            avatar: '/api/placeholder/100/100',
        },
        {
            name: 'Michael Johnson',
            role: 'Head of Operations',
            bio: 'Michael ensures that every order is fulfilled accurately and arrives on time. He oversees our warehouse and shipping operations.',
            avatar: '/api/placeholder/100/100',
        },
        {
            name: 'Sarah Williams',
            role: 'Media Curator',
            bio: 'Sarah handpicks our media collection, focusing on both bestsellers and rare gems across all categories.',
            avatar: '/api/placeholder/100/100',
        },
        {
            name: 'David Chen',
            role: 'Customer Experience',
            bio: 'David leads our customer support team, ensuring every shopper has a seamless experience from browsing to delivery.',
            avatar: '/api/placeholder/100/100',
        },
    ];

    // Company milestones
    const milestones: Milestone[] = [
        {
            year: '2020',
            title: 'Company Founded',
            description: 'Mediastore was established with a small collection of books and vinyl records.',
            icon: <BookOpen className="h-8 w-8 text-primary" />,
        },
        {
            year: '2021',
            title: 'Team Expansion',
            description: 'Grew our team to 15 media enthusiasts and expanded our product range.',
            icon: <Users className="h-8 w-8 text-primary" />,
        },
        {
            year: '2022',
            title: 'Nationwide Delivery',
            description: 'Launched our rush delivery service across all major cities in Vietnam.',
            icon: <TruckIcon className="h-8 w-8 text-primary" />,
        },
        {
            year: '2023',
            title: 'Digital Transformation',
            description: 'Revamped our platform with a modern e-commerce experience.',
            icon: <Globe className="h-8 w-8 text-primary" />,
        },
    ];

    return (
        <div className="space-y-12 py-6">
            {/* Hero Section */}
            <section className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">About Mediastore</h1>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                    We're passionate about connecting people with physical media in an increasingly digital world. Our carefully curated collection of books, music, and movies offers something for everyone.
                </p>
            </section>

            <Separator />

            {/* Our Story */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Our Story</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="mb-4">
                            Founded in 2020, Mediastore began as a small shop dedicated to preserving the joy of physical media in a world dominated by digital content.
                        </p>
                        <p className="mb-4">
                            We believe that there's something special about holding a book, placing a record on a turntable, or adding a DVD to your collection that digital formats simply can't replace.
                        </p>
                        <p>
                            Today, we're proud to offer Vietnam's most diverse collection of books, vinyl records, CDs, and DVDs, with nationwide delivery and exceptional customer service.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="bg-muted/30 py-10 rounded-lg">
                <div className="container">
                    <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-none bg-background">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2">Quality Selection</h3>
                                <p className="text-muted-foreground text-center">
                                    We carefully curate our media collection to ensure quality and diversity.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-background">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <TruckIcon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2">Reliable Service</h3>
                                <p className="text-muted-foreground text-center">
                                    Fast shipping and careful packaging for every order we fulfill.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-background">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-center mb-2">Community Focus</h3>
                                <p className="text-muted-foreground text-center">
                                    Supporting and building connections among media enthusiasts.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Company Timeline */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Our Journey</h2>
                <div className="space-y-6">
                    {milestones.map((milestone, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                                    {milestone.icon}
                                </div>
                                {index < milestones.length - 1 && (
                                    <div className="w-0.5 h-full bg-border mt-2"></div>
                                )}
                            </div>
                            <div className="pb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-primary">{milestone.year}</span>
                                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                                </div>
                                <p className="text-muted-foreground">{milestone.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-lg">{member.name}</h3>
                                    <p className="text-primary text-sm mb-2">{member.role}</p>
                                    <p className="text-muted-foreground text-center text-sm">{member.bio}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Location Section */}
            <section className="bg-muted/30 py-10 rounded-lg">
                <div className="container text-center">
                    <h2 className="text-2xl font-bold mb-6">Visit Our Store</h2>
                    <div className="flex justify-center mb-4">
                        <Map className="h-12 w-12 text-primary" />
                    </div>
                    <p className="max-w-md mx-auto mb-4">
                        While we primarily operate online, you can visit our physical store in Hanoi to browse our collection in person.
                    </p>
                    <p className="font-medium">
                        123 Media Street, Ba Dinh District, Hanoi, Vietnam
                    </p>
                    <p className="text-muted-foreground mt-2">
                        Open Monday-Saturday: 9am - 8pm | Sunday: 10am - 6pm
                    </p>
                </div>
            </section>
        </div>
    );
};
