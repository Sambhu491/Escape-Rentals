package com.fullstack.escape_rentals.dashboard.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {
    private Long totalBookings;
    private Long upcomingBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private BigDecimal totalSpent;
}
