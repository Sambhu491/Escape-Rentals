package com.fullstack.escape_rentals.dashboard.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostDashboardResponse {
    private Long totalProperties;
    private Long activeBookings;
    private Long completedBookings;
    private BigDecimal totalRevenue;
    private Double averageRating;
}
