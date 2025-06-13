// src/pages/client/Contact/Contact.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageSquare,
    ShoppingCart,
    HelpCircle,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schema
const contactFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    subject: z.string().min(2, { message: 'Subject is required' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const Contact: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    // Initialize form
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    // Handle form submission
    const onSubmit = (data: ContactFormValues) => {
        console.log('Form submitted:', data);
        // Here you would normally send the data to your API
        // For now, we'll just simulate a successful submission
        setTimeout(() => {
            setSubmitted(true);
            form.reset();
        }, 500);
    };

    // Contact info cards
    const contactCards = [
        {
            title: 'Email Us',
            icon: <Mail className="h-5 w-5" />,
            content: 'contact@mediastore.com',
            description: 'For general inquiries',
        },
        {
            title: 'Call Us',
            icon: <Phone className="h-5 w-5" />,
            content: '+84 (0)123 456 789',
            description: 'Mon-Sat: 9am - 6pm',
        },
        {
            title: 'Visit Us',
            icon: <MapPin className="h-5 w-5" />,
            content: '123 Media Street, Ba Dinh District, Hanoi',
            description: 'Find us in-store',
        },
    ];

    // FAQs
    const faqs = [
        {
            question: 'What are your shipping options?',
            answer: 'We offer standard shipping (2-3 business days) and rush delivery (next day) to all major cities in Vietnam.',
        },
        {
            question: 'How can I track my order?',
            answer: 'You can track your order by logging into your account and viewing your order history or by using the tracking number sent to your email.',
        },
        {
            question: 'What is your return policy?',
            answer: 'We accept returns within 30 days of purchase. Items must be in original condition with all packaging.',
        },
        {
            question: 'Do you ship internationally?',
            answer: 'Currently, we only ship within Vietnam. We hope to expand to international shipping in the future.',
        },
    ];

    return (
        <div className="space-y-10 py-6">
            {/* Contact Header */}
            <section className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Have questions, feedback, or need assistance? We're here to help. Reach out to our team through any
                    of the channels below.
                </p>
            </section>

            {/* Contact Cards */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {contactCards.map((card, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        {card.icon}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                                    <p className="mb-1">{card.content}</p>
                                    <p className="text-sm text-muted-foreground">{card.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Contact Form and Map */}
            <section className="grid md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>

                    {/* Success alert */}
                    {submitted && (
                        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>
                                Your message has been sent. We'll get back to you shortly.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">General Inquiry</SelectItem>
                                                <SelectItem value="order">Order Status</SelectItem>
                                                <SelectItem value="product">Product Question</SelectItem>
                                                <SelectItem value="return">Return Request</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Your message" className="min-h-[120px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </Form>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-6">Store Location</h2>
                    <div className="bg-muted rounded-lg h-[350px] flex items-center justify-center mb-4">
                        <div className="text-center">
                            <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Map view of our location</p>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                            <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium">Mediastore Headquarters</p>
                                <p className="text-muted-foreground">
                                    123 Media Street, Ba Dinh District, Hanoi, Vietnam
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-medium">Opening Hours</p>
                                <p className="text-muted-foreground">Monday-Saturday: 9am - 8pm</p>
                                <p className="text-muted-foreground">Sunday: 10am - 6pm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <HelpCircle className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium mb-2">{faq.question}</h3>
                                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <p className="mb-4 text-muted-foreground">Still have questions?</p>
                    <Button>
                        <Mail className="mr-2 h-4 w-4" /> Email Our Support Team
                    </Button>
                </div>
            </section>

            {/* Support Channels */}
            <section className="bg-muted/30 py-8 rounded-lg">
                <div className="container">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Support Channels</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-none bg-background">
                            <CardContent className="pt-6 text-center">
                                <MessageSquare className="h-8 w-8 mx-auto mb-4 text-primary" />
                                <h3 className="font-medium mb-2">Live Chat</h3>
                                <p className="text-sm text-muted-foreground">Available 9am-6pm, Monday-Friday</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-background">
                            <CardContent className="pt-6 text-center">
                                <ShoppingCart className="h-8 w-8 mx-auto mb-4 text-primary" />
                                <h3 className="font-medium mb-2">Order Support</h3>
                                <p className="text-sm text-muted-foreground">Track or modify your orders</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-background">
                            <CardContent className="pt-6 text-center">
                                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-primary" />
                                <h3 className="font-medium mb-2">Technical Support</h3>
                                <p className="text-sm text-muted-foreground">Help with website issues</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-background">
                            <CardContent className="pt-6 text-center">
                                <HelpCircle className="h-8 w-8 mx-auto mb-4 text-primary" />
                                <h3 className="font-medium mb-2">General Inquiries</h3>
                                <p className="text-sm text-muted-foreground">Product questions and more</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};
