// src/pages/client/ForgotPassword/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';

// Define form schema
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
    const { forgotPassword } = useAuthContext();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initialize form
    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await forgotPassword(values.email);
            setSuccess(true);
            form.reset();
        } catch (err: any) {
            setError(err?.message || 'Failed to send password reset email. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Forgot Password</h1>
                    <p className="text-muted-foreground mt-1">Reset your password to regain access to your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success ? (
                            <div className="text-center py-4">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Email Sent</h3>
                                <p className="text-muted-foreground mb-4">
                                    We've sent a password reset link to your email address. Please check your inbox and
                                    follow the instructions.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto"
                                        onClick={() => {
                                            setSuccess(false);
                                            setTimeout(() => form.setFocus('email'), 100);
                                        }}
                                    >
                                        try again
                                    </Button>
                                </p>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" asChild className="p-0">
                            <Link to="/login" className="flex items-center text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};