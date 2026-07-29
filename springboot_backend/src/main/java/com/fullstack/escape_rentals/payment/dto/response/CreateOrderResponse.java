package com.fullstack.escape_rentals.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponse {

    private String orderId;

    private String key;

    private long amount;

    private String currency;
}
