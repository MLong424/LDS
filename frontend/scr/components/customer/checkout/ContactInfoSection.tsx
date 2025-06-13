// src/components/customer/checkout/ContactInfoSection.tsx
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderDto } from '@cusTypes/orders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactInfoSectionProps {
    register: UseFormRegister<OrderDto>;
    errors: FieldErrors<OrderDto>;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
    register,
    errors,
}) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="recipient_name">Full Name</Label>
                        <Input
                            id="recipient_name"
                            {...register('recipient_name', { required: 'Full name is required' })}
                            placeholder="John Doe"
                        />
                        {errors.recipient_name && (
                            <p className="text-sm text-red-500">{errors.recipient_name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipient_email">Email</Label>
                        <Input
                            id="recipient_email"
                            type="email"
                            {...register('recipient_email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            placeholder="your.email@example.com"
                        />
                        {errors.recipient_email && (
                            <p className="text-sm text-red-500">{errors.recipient_email.message}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="recipient_phone">Phone Number</Label>
                    <Input
                        id="recipient_phone"
                        {...register('recipient_phone', {
                            required: 'Phone number is required',
                            pattern: {
                                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                                message: 'Invalid phone number format',
                            },
                        })}
                        placeholder="+84 123 456 789"
                    />
                    {errors.recipient_phone && (
                        <p className="text-sm text-red-500">{errors.recipient_phone.message}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};