// package com.fullstack.escape_rentals;

// import com.fullstack.escape_rentals.notification.gmail.GmailService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;

// @Component
// @RequiredArgsConstructor
// public class GmailTestRunner implements CommandLineRunner {

//     private final GmailService gmailService;

//     @Override
//     public void run(String... args) throws Exception {

//         gmailService.sendEmail(
//                 "john-does@notmailhere.nomailnothing",
//                 "Test Mail",
//                 "Hello from Escape Rentals"
//         );
//     }
// }