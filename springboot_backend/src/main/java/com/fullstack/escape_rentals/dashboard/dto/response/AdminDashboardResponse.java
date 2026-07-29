package com.fullstack.escape_rentals.dashboard.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    // Users
    private Long totalUsers;
    private Long totalHosts;
    private Long totalAdmins;

    // Properties
    private Long totalProperties;
    private Long activeProperties;
    private Long unavailableProperties;

    // Bookings
    private Long totalBookings;
    private Long pendingBookings;
    private Long bookingPaymentPending;
    private Long confirmedBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long expiredBookings;

    // Payments
    private Long paymentsReceived;
    private Long failedPayments;
    private Long refundedPayments;

    // Reviews
    private Long totalReviews;
    private Double averageRating;

    // Reports (moderation queue)
    private Long totalReports;
    private Long pendingReports;

    // Revenue (source: Booking.totalPrice where status = COMPLETED)
    private BigDecimal totalRevenue;
}
