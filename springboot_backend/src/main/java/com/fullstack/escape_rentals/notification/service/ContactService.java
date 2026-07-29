package com.fullstack.escape_rentals.notification.service;

import com.fullstack.escape_rentals.notification.dto.response.ContactRequest;

public interface ContactService {
    void createContact(ContactRequest request);
}
