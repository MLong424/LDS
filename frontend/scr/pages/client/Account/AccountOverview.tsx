// src/pages/client/Account/AccountOverview.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { Package, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AccountOverview: React.FC = () => {
    const { user, loading: userLoading, error: userError, updateProfile } = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    const getInitials = () => {
        if (!user) return '?';
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                address: formData.address,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (userLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        );
    }

    if (userError) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    There was an error loading your account information. Please refresh the page or try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Account Overview</h2>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-md bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium">
                                    Delivery Address
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Save Changes</Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-lg">
                                        {user?.first_name} {user?.last_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>

                            <Separator className="my-3" />

                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">Username:</dt>
                                    <dd className="text-sm font-medium">{user?.username}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">Phone Number:</dt>
                                    <dd className="text-sm font-medium">{user?.phone || 'Not specified'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">Delivery Address:</dt>
                                    <dd className="text-sm font-medium text-right max-w-[60%]">
                                        {user?.address || 'Not specified'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                </Badge>
                                {user?.roles.includes('ADMIN') && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>
                                )}
                                {user?.roles.includes('PRODUCT_MANAGER') && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Product Manager</Badge>
                                )}
                            </div>

                            <Separator className="my-3" />

                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">Customer since:</dt>
                                    <dd className="text-sm font-medium">
                                        {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-muted-foreground">Last updated:</dt>
                                    <dd className="text-sm font-medium">
                                        {user?.updatedAt ? formatDate(user.updatedAt) : 'Unknown'}
                                    </dd>
                                </div>
                            </dl>

                            <Separator className="my-3" />

                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/account/orders">
                                        <Package className="h-4 w-4 mr-2" />
                                        View My Orders
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/shop">Continue Shopping</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AccountOverview;
