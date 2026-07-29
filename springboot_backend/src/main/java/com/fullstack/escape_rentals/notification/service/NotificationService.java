package com.fullstack.escape_rentals.notification.service;

import java.math.BigDecimal;

public interface NotificationService {
    void sendOtpEmail(String firstName , String email, String otp);
    void sendBookingConfirmation(String firstName,String email, String bookingId);
    void sendPaymentConfirmation(String firstName,String email, String transactionId);
    void sendBookingRejection(String firstName, String email, String propertyTitle);
    public void sendHostBookingCancelledByGuest(
            String hostFirstName,
            String email,
            String propertyTitle,
            String bookingId,
            String guestName,
            String checkInDate,
            String checkOutDate);
    void sendPaymentRequiredNotification(String firstName, String email, String reservationId, BigDecimal amount);
    void sendPropertyReportToAdmin(
            String adminFirstName,
            String adminEmail,
            Long reportId,
            Long propertyId,
            String propertyTitle,
            String reporterName,
            String reportType,
            String description
    );

    void sendUserReportToAdmin(
            String adminFirstName,
            String adminEmail,
            Long reportId,
            Long reportedUserId,
            String reportedUserName,
            String reporterName,
            String reportType,
            String description
    );

}
