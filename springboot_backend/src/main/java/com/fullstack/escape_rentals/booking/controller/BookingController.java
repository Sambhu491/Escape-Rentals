package com.fullstack.escape_rentals.booking.controller;

import com.fullstack.escape_rentals.booking.dto.request.BookingFilterRequest;
import com.fullstack.escape_rentals.booking.dto.request.CreateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.request.UpdateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.response.BookingResponse;
import com.fullstack.escape_rentals.booking.service.BookingService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','HOST')")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.getBookingById(id, user)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOST','USER')")
    public ResponseEntity<Page<BookingResponse>> getBookings(
            @ModelAttribute BookingFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.getBookings(filter, pageable,user)
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER','ADMIN','HOST')")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {

        return ResponseEntity.ok(
                bookingService.getMyBookings(user.getId(), pageable)
        );
    }

    @GetMapping("/host")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<Page<BookingResponse>> getBookingsForHost(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsForHost(user.getId(), pageable)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, request, user)
        );
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> guestCancelledBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        bookingService.guestCancelledBooking(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.approveBooking(id, user)
        );
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.hostRejectedBooking(id, user)
        );
    }

    // Lets a host (or admin) cancel a booking that already moved past PENDING —
    // i.e. BOOKING_PAYMENT_PENDING or CONFIRMED — for both AUTO and MANUAL
    // approval properties. Previously hosts could only reject while PENDING.
    @PatchMapping("/{id}/host-cancel")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<BookingResponse> hostCancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.hostCancelBooking(id, user)
        );
    }

    // Admin-only payment reconciliation — distinct from approving/rejecting a
    // booking request. Only ever valid on a booking already awaiting payment;
    // does not skip the approval step the way the old "/confirm" endpoint did.
    @PatchMapping("/{id}/confirm-payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> adminConfirmPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.adminConfirmPayment(id, user)
        );
    }

    @PatchMapping("/{id}/reject-payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> adminRejectPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                bookingService.adminRejectPayment(id, user)
        );
    }
}













