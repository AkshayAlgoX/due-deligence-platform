package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Response for POST /api/subscription/create-order — feeds the Cashfree drop-in SDK. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderResponse {

    private boolean success;
    private String paymentSessionId;
    private String orderId;
    private String plan;
    private long amount;
    private String currency;
    private String message;
}
