// src/models/factory/DeliveryInfoFactory.ts
import { DeliveryInfo, StandardDeliveryInfo, RushDeliveryInfo } from '../entity/DeliveryInfo';
import { DeliveryType } from '../entity/common';
// Factory for creating delivery info
export class DeliveryInfoFactory {
    public static createDeliveryInfo(deliveryType: DeliveryType, data: any): DeliveryInfo {
        switch (deliveryType) {
            case 'RUSH':
                return this.createRushDelivery(data);
            case 'STANDARD':
            default:
                return this.createStandardDelivery(data);
        }
    }

    private static createStandardDelivery(data: any): StandardDeliveryInfo {
        const delivery = new StandardDeliveryInfo();
        this.populateBaseDelivery(delivery, data);
        return delivery;
    }

    private static createRushDelivery(data: any): RushDeliveryInfo {
        const delivery = new RushDeliveryInfo();
        this.populateBaseDelivery(delivery, data);
        delivery.rush_delivery_time = data.rush_delivery_time;
        delivery.rush_delivery_instructions = data.rush_delivery_instructions;
        return delivery;
    }

    private static populateBaseDelivery(delivery: DeliveryInfo, data: any): void {
        delivery.order_id = data.order_id;
        delivery.recipient_name = data.recipient_name;
        delivery.recipient_email = data.recipient_email;
        delivery.recipient_phone = data.recipient_phone;
        delivery.delivery_province = data.delivery_province;
        delivery.delivery_address = data.delivery_address;
        delivery.delivery_type = data.delivery_type;
        delivery.standard_delivery_fee = data.standard_delivery_fee;
        delivery.rush_delivery_fee = data.rush_delivery_fee;
    }

    public static validateDeliveryData(deliveryType: DeliveryType, data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic validation
        if (!data.recipient_name) errors.push('Recipient name is required');
        if (!data.recipient_email) errors.push('Recipient email is required');
        if (!data.delivery_province) errors.push('Delivery province is required');
        if (!data.delivery_address) errors.push('Delivery address is required');

        // Type-specific validation
        if (deliveryType === 'RUSH') {
            if (!data.rush_delivery_time) {
                errors.push('Rush delivery time is required for rush delivery');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
