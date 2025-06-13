// src/components/customer/checkout/DeliveryOptionsSection.tsx
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { OrderDto, DeliveryType } from '@cusTypes/orders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeliveryOptionsSectionProps {
    register: UseFormRegister<OrderDto>;
    deliveryType: DeliveryType;
    onDeliveryTypeChange: (value: DeliveryType) => void;
}

export const DeliveryOptionsSection: React.FC<DeliveryOptionsSectionProps> = ({
    register,
    deliveryType,
    onDeliveryTypeChange,
}) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup
                    defaultValue="STANDARD"
                    value={deliveryType}
                    onValueChange={(value) => onDeliveryTypeChange(value as DeliveryType)}
                >
                    <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                        <RadioGroupItem value="STANDARD" id="standard-delivery" className="mt-1" />
                        <div className="grid gap-1">
                            <Label htmlFor="standard-delivery" className="font-medium">
                                Standard Delivery
                            </Label>
                            <p className="text-sm text-muted-foreground">Arrives in 3-5 business days</p>
                        </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50">
                        <RadioGroupItem value="RUSH" id="rush-delivery" className="mt-1" />
                        <div className="grid gap-1">
                            <Label htmlFor="rush-delivery" className="font-medium">
                                Rush Delivery
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Arrives within 24 hours (additional fees may apply)
                            </p>
                        </div>
                    </div>
                </RadioGroup>

                <input type="hidden" {...register('delivery_type')} value={deliveryType} />

                {deliveryType === 'RUSH' && (
                    <RushDeliveryOptions register={register} />
                )}
            </CardContent>
        </Card>
    );
};

interface RushDeliveryOptionsProps {
    register: UseFormRegister<OrderDto>;
}

const RushDeliveryOptions: React.FC<RushDeliveryOptionsProps> = ({ register }) => {
    return (
        <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/30">
            <div className="space-y-2">
                <Label htmlFor="rush_delivery_time">Preferred Delivery Time</Label>
                <Input
                    id="rush_delivery_time"
                    type="datetime-local"
                    {...register('rush_delivery_time')}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="rush_delivery_instructions">Delivery Instructions</Label>
                <Textarea
                    id="rush_delivery_instructions"
                    {...register('rush_delivery_instructions')}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                />
            </div>
        </div>
    );
};