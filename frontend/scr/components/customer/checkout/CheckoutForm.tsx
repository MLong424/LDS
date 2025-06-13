// src/components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OrderDto, DeliveryType } from '@cusTypes/orders';

// Import the new focused components
import { ContactInfoSection } from './ContactInfoSection';
import { ShippingAddressSection } from './ShippingAddressSection';
import { DeliveryOptionsSection } from './DeliveryOptionsSection';
import { CheckoutFormActions } from './CheckoutFormActions';

interface CheckoutFormProps {
    onSubmit: (data: OrderDto) => void;
    loading: boolean;
    error: string | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, loading, error }) => {
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OrderDto>({
        defaultValues: {
            delivery_type: 'STANDARD',
        },
    });

    const handleDeliveryTypeChange = (value: DeliveryType) => {
        setDeliveryType(value);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ContactInfoSection 
                register={register} 
                errors={errors} 
            />
            
            <ShippingAddressSection 
                register={register} 
                errors={errors} 
            />
            
            <DeliveryOptionsSection
                register={register}
                deliveryType={deliveryType}
                onDeliveryTypeChange={handleDeliveryTypeChange}
            />
            
            <CheckoutFormActions 
                loading={loading} 
                error={error} 
            />
        </form>
    );
};

export default CheckoutForm;
