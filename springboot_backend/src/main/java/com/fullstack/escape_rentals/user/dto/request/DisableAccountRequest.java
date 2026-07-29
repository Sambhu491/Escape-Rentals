package com.fullstack.escape_rentals.user.dto.request;

import com.fullstack.escape_rentals.user.dto.DisableDuration;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisableAccountRequest {

    @NotNull(message = "Disable duration is required")
    private DisableDuration duration;
}
