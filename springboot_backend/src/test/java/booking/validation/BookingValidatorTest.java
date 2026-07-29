package booking.validation;

import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.booking.validation.BookingValidator;
import com.fullstack.escape_rentals.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingValidatorTest {

    @Mock
    private BookingRepository bookingRepository;

    private BookingValidator validator;

    @BeforeEach
    void setup() {
        validator = new BookingValidator(bookingRepository);
    }

    @Test
    void shouldRejectOverlappingBooking() {

        when(
                bookingRepository.existsOverlappingBooking(
                        anyLong(),
                        any(),
                        any(),
                        anyList()
                )
        ).thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> validator.validateAvailability(
                        1L,
                        LocalDate.of(2026,1,10),
                        LocalDate.of(2026,1,15)
                )
        );
    }

    @Test
    void shouldAllowAvailableDates() {

        when(
                bookingRepository.existsOverlappingBooking(
                        anyLong(),
                        any(),
                        any(),
                        anyList()
                )
        ).thenReturn(false);

        assertDoesNotThrow(
                () -> validator.validateAvailability(
                        1L,
                        LocalDate.of(2026,1,10),
                        LocalDate.of(2026,1,15)
                )
        );
    }
}