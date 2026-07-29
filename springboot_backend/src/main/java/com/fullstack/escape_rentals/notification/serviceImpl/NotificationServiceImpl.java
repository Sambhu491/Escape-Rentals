package com.fullstack.escape_rentals.notification.serviceImpl;

//import brevo.ApiClient;
//import brevo.Configuration;
//import brevo.auth.ApiKeyAuth;
//import brevoApi.TransactionalEmailsApi;
//import brevoModel.SendSmtpEmail;
//import brevoModel.SendSmtpEmailSender;
//import brevoModel.SendSmtpEmailTo;
//import java.util.Collections;
import com.fullstack.escape_rentals.notification.gmail.GmailService;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final TemplateEngine templateEngine;
    private final GmailService gmailService;

    private void sendEmail(
            String to,
            String subject,
            String templateName,
            Map<String, Object> variables,
            String textVersion
    ) {

        try {
            Context context = new Context();
            context.setVariables(variables);
            String html = templateEngine.process(templateName, context);
            gmailService.sendEmail(
                    to,
                    subject,
                    html
            );
            log.info("Email sent successfully to {}", to);

        } catch(Exception e){
            log.error("EMAIL ERROR {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }


    @Override
    public void sendOtpEmail(String firstName,String email, String otp) {

        log.info("FIRST NAME = {}", firstName);

        Map<String, Object> vars = new HashMap<>();
        vars.put("firstName", firstName);
        vars.put("otpCode", otp);

        String plainText = "Hello " + firstName + ",\n\nYour Escape Rentals OTP code is: " + otp + "\n\nThis code will expire in 5 minutes.";

        log.info("VARS = {}", vars);

        sendEmail(
                email,
                "Verify Your Account - Escape Rentals",
                "otp-email",
                vars,
                plainText
        );
    }

    @Override
    @Async
    public void sendBookingConfirmation(String firstName, String email, String bookingId) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("firstName", firstName);
        vars.put("bookingId", bookingId);

        String plainText = "Your booking has been confirmed! Booking ID: " + bookingId;

        sendEmail(
                email,
                "Booking Confirmed",
                "booking-confirmation",
                vars,
                plainText
        );
    }

    @Override
    @Async
    public void sendPaymentConfirmation( String firstName, String email, String transactionId) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("firstName", firstName);
        vars.put("paymentId", transactionId);

        String plainText = "Payment Successful! Transaction ID: " + transactionId;

        sendEmail(
                email,
                "Payment Successful",
                "payment-confirmation",
                vars,
                plainText
        );
    }

    @Override
    public void sendPaymentRequiredNotification(String firstName, String email, String reservationId, BigDecimal amount) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("firstName", firstName);
        vars.put("reservationId", reservationId);
        vars.put("amount", amount);

        String plainText = "Payment Required. Your reservation ID: "
                + reservationId
                + " requires payment of "
                + amount;

        sendEmail(
                email,
                "Payment Required",
                "payment-required-notification",
                vars,
                plainText
        );
    }


    @Override
    public void sendBookingRejection(
            String firstName,
            String email,
            String propertyTitle) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("firstName", firstName);
        vars.put("propertyTitle", propertyTitle);

        String plainText = """
            Hello %s,

            Unfortunately, your booking request for "%s" has been cancelled by the host.

            No payment will be charged for this booking. You can continue browsing other available properties on Escape Rentals.

            Thank you for choosing Escape Rentals.
            """
                .formatted(firstName, propertyTitle);

        sendEmail(
                email,
                "Booking Request Cancelled",
                "booking-rejection",
                vars,
                plainText
        );
    }



    @Override
    @Async
    public void sendHostBookingCancelledByGuest(
            String hostFirstName,
            String email,
            String propertyTitle,
            String bookingId,
            String guestName,
            String checkInDate,
            String checkOutDate) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("hostFirstName", hostFirstName);
        vars.put("propertyTitle", propertyTitle);
        vars.put("bookingId", bookingId);
        vars.put("guestName", guestName);
        vars.put("checkInDate", checkInDate);
        vars.put("checkOutDate", checkOutDate);

        String plainText = """
        Hello %s,

        Guest has cancelled their booking for your property "%s".

        Booking Details:

        Booking ID: %s
        Guest Name: %s
        Check-in Date: %s
        Check-out Date: %s

        The property availability has been updated. You can review your bookings from your host dashboard.

        Thank you for being a part of Escape Rentals.
        """
                .formatted(
                        hostFirstName,
                        propertyTitle,
                        bookingId,
                        guestName,
                        checkInDate,
                        checkOutDate
                );

        sendEmail(
                email,
                "Guest Cancelled Booking",
                "booking-cancelled-host",
                vars,
                plainText
        );
    }

    @Override
    @Async
    public void sendPropertyReportToAdmin(
            String adminFirstName,
            String adminEmail,
            Long reportId,
            Long propertyId,
            String propertyTitle,
            String reporterName,
            String reportType,
            String description) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("adminFirstName", adminFirstName);
        vars.put("reportId", reportId);
        vars.put("propertyId", propertyId);
        vars.put("propertyTitle", propertyTitle);
        vars.put("reporterName", reporterName);
        vars.put("reportType", reportType);
        vars.put("description", description);

        String plainText = """
        Hello %s,

        A new property report has been submitted on Escape Rentals.

        Report ID: %s
        Report Type: %s
        Property: %s (ID: %s)
        Reported By: %s

        Description:
        %s

        Please review this report from your admin dashboard and take the appropriate action.

        Escape Rentals
        """
                .formatted(
                        adminFirstName,
                        reportId,
                        reportType,
                        propertyTitle,
                        propertyId,
                        reporterName,
                        description
                );

        sendEmail(
                adminEmail,
                "New Property Report - Action Required",
                "property-report-admin",
                vars,
                plainText
        );
    }

    @Override
    @Async
    public void sendUserReportToAdmin(
            String adminFirstName,
            String adminEmail,
            Long reportId,
            Long reportedUserId,
            String reportedUserName,
            String reporterName,
            String reportType,
            String description) {

        Map<String, Object> vars = new HashMap<>();
        vars.put("adminFirstName", adminFirstName);
        vars.put("reportId", reportId);
        vars.put("reportedUserId", reportedUserId);
        vars.put("reportedUserName", reportedUserName);
        vars.put("reporterName", reporterName);
        vars.put("reportType", reportType);
        vars.put("description", description);

        String plainText = """
        Hello %s,

        A new user report has been submitted on Escape Rentals.

        Report ID: %s
        Report Type: %s
        Reported User: %s (ID: %s)
        Reported By: %s

        Description:
        %s

        Please review this report from your admin dashboard and take the appropriate action.

        Escape Rentals
        """
                .formatted(
                        adminFirstName,
                        reportId,
                        reportType,
                        reportedUserName,
                        reportedUserId,
                        reporterName,
                        description
                );

        sendEmail(
                adminEmail,
                "New User Report - Action Required",
                "user-report-admin",
                vars,
                plainText
        );
    }

}