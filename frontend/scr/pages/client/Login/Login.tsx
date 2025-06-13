// src/pages/client/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, ArrowRight, Loader2, UserCog, ShoppingBag, UserCircle } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Checkbox } from '@components/ui/checkbox';
import { Separator } from '@components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import { UserRole } from '@cusTypes/auth';

// Define form schema
const loginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const { login } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justRegistered, setJustRegistered] = useState(false);
    const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    // Check if user just registered
    useEffect(() => {
        if (location.state && location.state.registered) {
            setJustRegistered(true);
        }
    }, [location.state]);

    // Initialize form
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setSubmitting(true);
        setError(null);
        setUserRoles(null);

        try {
            const response = await login({
                username: values.username,
                password: values.password,
            });

            // Check if user has multiple roles
            const roles = response?.data?.roles;
            
            if (roles && roles.length > 1) {
                // User has multiple roles, let them choose
                setUserRoles(roles);
                setSubmitting(false);
                return;
            }
            
            // Single role, redirect based on role
            redirectBasedOnRole(roles?.[0]);
        } catch (err: any) {
            setError(err?.message || 'Login failed. Please check your credentials and try again.');
            setSubmitting(false);
        }
    };

    const handleRoleSelection = (role: UserRole) => {
        setSelectedRole(role);
    };

    const confirmRoleSelection = () => {
        if (selectedRole) {
            redirectBasedOnRole(selectedRole);
        }
    };

    const redirectBasedOnRole = (role: UserRole) => {
        switch (role) {
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            case 'PRODUCT_MANAGER':
                navigate('/manager/dashboard');
                break;
            case 'CUSTOMER':
            default:
                navigate('/');
                break;
        }
    };

    // Get role icon based on role type
    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'ADMIN':
                return <UserCog className="h-5 w-5" />;
            case 'PRODUCT_MANAGER':
                return <ShoppingBag className="h-5 w-5" />;
            case 'CUSTOMER':
                return <UserCircle className="h-5 w-5" />;
            default:
                return <UserCircle className="h-5 w-5" />;
        }
    };

    // Get role description based on role type
    const getRoleDescription = (role: UserRole) => {
        switch (role) {
            case 'ADMIN':
                return 'Full system access and user management';
            case 'PRODUCT_MANAGER':
                return 'Manage products, inventory and orders';
            case 'CUSTOMER':
                return 'Browse and purchase products';
            default:
                return '';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            {userRoles ? 'Select your role to continue' : 'Enter your credentials to access your account'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {justRegistered && !userRoles && (
                            <Alert className="mb-4 bg-green-50 border-green-200">
                                <AlertDescription className="text-green-700">
                                    Registration successful! Please login with your new account.
                                </AlertDescription>
                            </Alert>
                        )}

                        {userRoles ? (
                            // Role selection form
                            <div className="space-y-4">
                                <div className="text-sm mb-2">
                                    Your account has multiple roles. Please select which role you want to use:
                                </div>
                                <RadioGroup
                                    value={selectedRole || ''}
                                    onValueChange={(value) => handleRoleSelection(value as UserRole)}
                                    className="space-y-3"
                                >
                                    {userRoles.map((role) => (
                                        <div
                                            key={role}
                                            className={`flex items-center space-x-2 border rounded-md p-3 transition-colors ${
                                                selectedRole === role
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                        >
                                            <RadioGroupItem value={role} id={role} />
                                            <div className="flex items-center flex-1">
                                                <label
                                                    htmlFor={role}
                                                    className="flex items-center cursor-pointer flex-1"
                                                >
                                                    <div className="mr-2">{getRoleIcon(role)}</div>
                                                    <div>
                                                        <div className="font-medium">{role}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {getRoleDescription(role)}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <Button
                                    onClick={confirmRoleSelection}
                                    className="w-full mt-4"
                                    disabled={!selectedRole}
                                >
                                    Continue as {selectedRole}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setUserRoles(null);
                                        form.reset();
                                    }}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            // Login form
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="johndoe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel>Password</FormLabel>
                                                    <Link
                                                        to="/forgot-password"
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center space-x-2">
                                        <FormField
                                            control={form.control}
                                            name="rememberMe"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {!userRoles && (
                            <>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <Separator />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-2 text-muted-foreground text-xs">OR</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                                        Continue as Guest
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                    {!userRoles && (
                        <CardFooter className="flex justify-center">
                            <span className="text-muted-foreground text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    Create one
                                </Link>
                            </span>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
};