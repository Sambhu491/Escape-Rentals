package com.fullstack.escape_rentals.booking.repository;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<BookingEntity,Long> ,
        JpaSpecificationExecutor<BookingEntity> {

    @Query("""
        SELECT COUNT(b) > 0
        FROM BookingEntity b
        WHERE b.property.id = :propertyId
          AND b.status IN :blockingStatuses
          AND :checkIn < b.checkOutDate
          AND :checkOut > b.checkInDate
    """)
    boolean existsOverlappingBooking(
            @Param("propertyId") Long propertyId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("blockingStatuses") Collection<BookingStatus> blockingStatuses
    );

    @Query("""
    SELECT COUNT(b) > 0
    FROM BookingEntity b
    WHERE b.property.id = :propertyId
      AND b.id <> :bookingId
      AND b.status IN :blockingStatuses
      AND :checkIn < b.checkOutDate
      AND :checkOut > b.checkInDate
""")
    boolean existsOverlappingBookingExcept(

            @Param("bookingId") Long bookingId,

            @Param("propertyId") Long propertyId,

            @Param("checkIn") LocalDate checkIn,

            @Param("checkOut") LocalDate checkOut,

            @Param("blockingStatuses") Collection<BookingStatus> blockingStatuses

    );

    boolean existsByGuestIdAndPropertyIdAndStatus(
            Long guestId,
            Long propertyId,
            BookingStatus status
    );

    // Reviews are allowed once a booking is confirmed and paid, not only after
    // the stay has fully completed — see ReviewValidator.validateCanReview.
    boolean existsByGuestIdAndPropertyIdAndStatusIn(
            Long guestId,
            Long propertyId,
            Collection<BookingStatus> statuses
    );

    @Query("""
        SELECT COUNT(b)
        FROM BookingEntity b
        WHERE b.property.host.id = :hostId
        AND b.status IN :statuses
    """)
    Long countHostBookingsByStatuses(
            @Param("hostId") Long hostId,
            @Param("statuses") Collection<BookingStatus> statuses
    );


    default Long countHostActiveBookings(Long hostId){

        return countHostBookingsByStatuses(
                hostId,
                List.of(
                        BookingStatus.CONFIRMED,
                        BookingStatus.PENDING,
                        BookingStatus.BOOKING_PAYMENT_PENDING
                )
        );
    }

    default Long countHostCompletedBookings(Long hostId){

        return countHostBookingsByStatuses(
                hostId,
                List.of(
                        BookingStatus.COMPLETED
                )
        );
    }

    @Query("""
        SELECT COALESCE(SUM(b.totalPrice),0)
        FROM BookingEntity b
        WHERE b.property.host.id = :hostId
        AND b.status = :status
    """)
    BigDecimal calculateHostRevenueByStatus(
            @Param("hostId") Long hostId,
            @Param("status") BookingStatus status
    );


    default BigDecimal calculateHostRevenue(Long hostId){

        return calculateHostRevenueByStatus(
                hostId,
                BookingStatus.COMPLETED
        );
    }

    List<BookingEntity> findByStatusAndCheckOutDateBefore(
            BookingStatus status,
            LocalDate date
    );


    @Modifying
    @Query("""
    UPDATE BookingEntity b
    SET b.status = :expiredStatus
    WHERE b.status = :pendingStatus
    AND b.createdAt < :cutoff
""")
    int expirePendingBookings(
            @Param("cutoff") LocalDateTime cutoff,
            @Param("pendingStatus") BookingStatus pendingStatus,
            @Param("expiredStatus") BookingStatus expiredStatus
    );

    List<BookingEntity> findByPropertyIdAndStatusIn(Long propertyId, List<BookingStatus> statuses);

    List<BookingEntity> findByStatusAndPaymentDeadlineBefore(BookingStatus bookingStatus, LocalDateTime now);

    // ----- Dashboard: USER (guest-scoped) -----

    long countByGuestId(Long guestId);

    long countByGuestIdAndStatus(Long guestId, BookingStatus status);

    long countByGuestIdAndStatusIn(Long guestId, Collection<BookingStatus> statuses);

    long countByGuestIdAndStatusAndCheckInDateGreaterThanEqual(
            Long guestId,
            BookingStatus status,
            LocalDate fromDate
    );

    @Query("""
        SELECT COALESCE(SUM(b.totalPrice),0)
        FROM BookingEntity b
        WHERE b.guest.id = :guestId
        AND b.status = :status
    """)
    BigDecimal calculateGuestSpentByStatus(
            @Param("guestId") Long guestId,
            @Param("status") BookingStatus status
    );


    default BigDecimal calculateGuestSpent(Long guestId){
        return calculateGuestSpentByStatus(guestId, BookingStatus.COMPLETED);
    }

    // ----- Dashboard: ADMIN (platform-wide) -----

    long countByStatus(BookingStatus status);

    @Query("""
        SELECT COALESCE(SUM(b.totalPrice),0)
        FROM BookingEntity b
        WHERE b.status = :status
    """)
    BigDecimal calculateTotalRevenueByStatus(
            @Param("status") BookingStatus status
    );

    default BigDecimal calculateTotalRevenue(){
        return calculateTotalRevenueByStatus(BookingStatus.COMPLETED);
    }


}
