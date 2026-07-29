package com.fullstack.escape_rentals.notification.controller;

import com.fullstack.escape_rentals.notification.dto.response.ContactRequest;
import com.fullstack.escape_rentals.notification.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;


    @PostMapping
    public ResponseEntity<Void> submit(
            @Valid @RequestBody ContactRequest request
    ){

        contactService.createContact(request);

        return ResponseEntity.ok().build();
    }
}
