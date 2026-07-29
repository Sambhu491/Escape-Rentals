package com.fullstack.escape_rentals.dashboard.serviceImpl;


import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.dashboard.dto.response.AdminDashboardResponse;
import com.fullstack.escape_rentals.dashboard.dto.response.HostDashboardResponse;
import com.fullstack.escape_rentals.dashboard.dto.response.UserDashboardResponse;
import com.fullstack.escape_rentals.dashboard.service.DashboardService;
import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import com.fullstack.escape_rentals.payment.repository.PaymentRepository;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.report.repository.ReportRepository;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PaymentRepository paymentRepository;
    private final ReportRepository reportRepository;

    @Override
    public HostDashboardResponse getHostDashboard(Long hostId) {

        UserEntity host = userRepository.findById(hostId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found")
                );


        if(host.getRole() != Role.ROLE_HOST){
            throw new AccessDeniedException(
                    "Only hosts can access dashboard"
            );
        }

        Long totalProperties =
                propertyRepository.countByHostIdAndDeletedFalse(hostId);

        Long activeBookings =
                bookingRepository.countHostActiveBookings(hostId);

        Long completedBookings =
                bookingRepository.countHostCompletedBookings(hostId);

        BigDecimal revenue =
                bookingRepository.calculateHostRevenue(hostId);

        Double averageRating =
                reviewRepository.findAverageRatingByHostId(hostId);


        return HostDashboardResponse.builder()
                .totalProperties(totalProperties)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .totalRevenue(
                        revenue == null
                                ? BigDecimal.ZERO
                                : revenue
                )
                .averageRating(
                        averageRating == null
                                ? 0.0
                                : averageRating
                )
                .build();
    }


    @Override
    public UserDashboardResponse getUserDashboard(Long userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("User not found")
                );

        Long totalBookings =
                bookingRepository.countByGuestId(userId);

        Long upcomingBookings =
                bookingRepository.countByGuestIdAndStatusAndCheckInDateGreaterThanEqual(
                        userId,
                        BookingStatus.CONFIRMED,
                        LocalDate.now()
                );

        Long completedBookings =
                bookingRepository.countByGuestIdAndStatus(
                        userId,
                        BookingStatus.COMPLETED
                );

        Long cancelledBookings =
                bookingRepository.countByGuestIdAndStatusIn(
                        userId,
                        List.of(
                                BookingStatus.GUEST_CANCELLED,
                                BookingStatus.HOST_CANCELLED
                        )
                );

        BigDecimal totalSpent =
                bookingRepository.calculateGuestSpent(userId);


        return UserDashboardResponse.builder()
                .totalBookings(totalBookings)
                .upcomingBookings(upcomingBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalSpent(
                        totalSpent == null
                                ? BigDecimal.ZERO
                                : totalSpent
                )
                .build();
    }


    @Override
    public AdminDashboardResponse getAdminDashboard() {

        // Users (soft-delete aware)
        Long totalUsers = userRepository.countByDeletedFalse();
        Long totalHosts = userRepository.countByRoleAndDeletedFalse(Role.ROLE_HOST);
        Long totalAdmins = userRepository.countByRoleAndDeletedFalse(Role.ROLE_ADMIN);

        // Reports (moderation queue)
        Long totalReports = reportRepository.count();
        Long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);


        // Properties (soft-delete aware)
        Long totalProperties = propertyRepository.countByDeletedFalse();
        Long activeProperties =
                propertyRepository.countByStatusAndDeletedFalse(PropertyStatus.AVAILABLE);
        Long unavailableProperties =
                propertyRepository.countByStatusAndDeletedFalse(PropertyStatus.UNAVAILABLE);

        // Bookings
        Long totalBookings = bookingRepository.count();
        Long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        Long bookingPaymentPending =
                bookingRepository.countByStatus(BookingStatus.BOOKING_PAYMENT_PENDING);
        Long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        Long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        Long cancelledBookings =
                bookingRepository.countByStatus(BookingStatus.GUEST_CANCELLED)
                        + bookingRepository.countByStatus(BookingStatus.HOST_CANCELLED);
        Long expiredBookings = bookingRepository.countByStatus(BookingStatus.EXPIRED);

        // Payments
        Long paymentsReceived = paymentRepository.countByStatus(PaymentStatus.PAID);
        Long failedPayments = paymentRepository.countByStatus(PaymentStatus.FAILED);
        Long refundedPayments = paymentRepository.countByStatus(PaymentStatus.REFUNDED);

        // Reviews
        Long totalReviews = reviewRepository.count();
        Double averageRating = reviewRepository.findAverageRating();

        // Revenue (source: Booking.totalPrice where status = COMPLETED)
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();


        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalHosts(totalHosts)
                .totalAdmins(totalAdmins)
                .totalProperties(totalProperties)
                .activeProperties(activeProperties)
                .unavailableProperties(unavailableProperties)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .bookingPaymentPending(bookingPaymentPending)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .expiredBookings(expiredBookings)
                .paymentsReceived(paymentsReceived)
                .failedPayments(failedPayments)
                .refundedPayments(refundedPayments)
                .totalReviews(totalReviews)
                .averageRating(
                        averageRating == null
                                ? 0.0
                                : averageRating
                )
                .totalRevenue(
                        totalRevenue == null
                                ? BigDecimal.ZERO
                                : totalRevenue
                )
                .totalReports(totalReports)
                .pendingReports(pendingReports)
                .build();
    }
}