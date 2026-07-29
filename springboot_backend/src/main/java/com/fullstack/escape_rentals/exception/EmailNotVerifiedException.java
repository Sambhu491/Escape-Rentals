package com.fullstack.escape_rentals.exception;

public class EmailNotVerifiedException  extends RuntimeException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
