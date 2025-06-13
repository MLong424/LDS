// src/components/customer/checkout/ShippingAddressSection.tsx
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderDto } from '@cusTypes/orders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShippingAddressSectionProps {
    register: UseFormRegister<OrderDto>;
    errors: FieldErrors<OrderDto>;
}

export const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({
    register,
    errors,
}) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="delivery_province">Province</Label>
                    <Input
                        id="delivery_province"
                        {...register('delivery_province', { required: 'Province is required' })}
                        placeholder="Hanoi"
                    />
                    {errors.delivery_province && (
                        <p className="text-sm text-red-500">{errors.delivery_province.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="delivery_address">Detailed Address</Label>
                    <Textarea
                        id="delivery_address"
                        {...register('delivery_address', { required: 'Address is required' })}
                        placeholder="123 Example Street, Ba Dinh District"
                        rows={3}
                    />
                    {errors.delivery_address && (
                        <p className="text-sm text-red-500">{errors.delivery_address.message}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};