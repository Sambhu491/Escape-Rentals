package com.fullstack.escape_rentals.booking.service;

import com.fullstack.escape_rentals.booking.dto.request.BookingFilterRequest;
import com.fullstack.escape_rentals.booking.dto.request.CreateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.request.UpdateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.response.BookingResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request,CustomUserDetails user);
    BookingResponse getBookingById(Long bookingId, CustomUserDetails currentUser);
    Page<BookingResponse> getBookings(BookingFilterRequest filter, Pageable pageable,CustomUserDetails currentUser);
    Page<BookingResponse> getMyBookings(Long guestId, Pageable pageable);
    Page<BookingResponse> getBookingsForHost(Long hostId, Pageable pageable);
    BookingResponse updateBooking(Long bookingId, UpdateBookingRequest request, CustomUserDetails currentUser);
    void guestCancelledBooking(Long bookingId, CustomUserDetails currentUser);

    BookingResponse approveBooking(Long bookingId,
                                   CustomUserDetails user);

    BookingResponse hostRejectedBooking(Long bookingId,
                                  CustomUserDetails user);

    BookingResponse hostCancelBooking(Long bookingId,
                                  CustomUserDetails user);

    // Admin "confirm booking" is intentionally NOT here — an admin confirming
    // a booking request uses the exact same approveBooking(...) method a host
    // uses (both roles are already permitted). These two are the distinct,
    // payment-specific reconciliation actions instead.
    BookingResponse adminConfirmPayment(Long bookingId,
                                  CustomUserDetails user);

    BookingResponse adminRejectPayment(Long bookingId,
                                  CustomUserDetails user);
}
