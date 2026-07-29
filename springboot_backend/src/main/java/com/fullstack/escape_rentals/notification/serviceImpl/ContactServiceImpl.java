package com.fullstack.escape_rentals.notification.serviceImpl;

import com.fullstack.escape_rentals.notification.dto.response.ContactRequest;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.ContactService;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {
    private final InAppNotificationService notificationService;

    @Override
    public void createContact(ContactRequest request){

        notificationService.notifyAdmins(
                NotificationType.CONTACT,
                "New contact message",
                "From: "
                        + request.getName()
                        + " ("
                        + request.getEmail()
                        + ")\n\n"
                        + request.getMessage(),
                null
        );
    }
}
