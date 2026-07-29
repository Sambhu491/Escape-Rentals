package com.fullstack.escape_rentals.otp.util;

import java.security.SecureRandom;

public class OtpGenerator {
    private static final SecureRandom random = new SecureRandom();

    public static String generate() {
        return String.valueOf(100000 + random.nextInt(900000));
    }
}
