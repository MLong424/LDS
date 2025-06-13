// src/pages/client/ResetPassword/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';

// Define form schema
const resetPasswordSchema = z
    .object({
        password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
    const { resetPassword } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Extract token from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const tokenParam = searchParams.get('token');

        if (!tokenParam) {
            setError('Reset token is missing. Please use the link from your email.');
            return;
        }

        setToken(tokenParam);
    }, [location]);

    // Initialize form
    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: ResetPasswordFormValues) => {
        if (!token) {
            setError('Reset token is missing. Please use the link from your email.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await resetPassword(token, values.password);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || 'Password reset failed. Please try again or request a new reset link.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-muted-foreground mt-1">Create a new password for your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Please enter your new password below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success ? (
                            <div className="text-center py-4">
                                <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Password Reset Complete</h3>
                                <p className="text-muted-foreground mb-6">
                                    Your password has been reset successfully. You can now log in with your new
                                    password.
                                </p>
                                <Button onClick={handleBackToLogin} className="w-full">
                                    Continue to Login
                                </Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={submitting || !token}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resetting Password...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        {!success && (
                            <Button variant="link" asChild className="p-0">
                                <Link to="/login" className="flex items-center text-primary">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};