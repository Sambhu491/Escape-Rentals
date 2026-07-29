package com.fullstack.escape_rentals.user.entity;

// Model: id, email, password, active_status

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.comment.entity.CommentEntity;
import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.notification.entity.NotificationEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.saved.entity.SavedPropertyEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false,unique = true, length = 300)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false,unique = true, length = 20)
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Enter a valid 10-digit mobile number"
    )
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    private LocalDateTime disabledUntil;

    @Builder.Default
    private boolean deleted = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @OneToMany(
            mappedBy = "host",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<PropertyEntity> properties = new HashSet<>();


    @OneToMany(
            mappedBy = "guest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<BookingEntity> bookings = new HashSet<>();


    @OneToMany(
            mappedBy = "guest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<ReviewEntity> reviews = new HashSet<>();


    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<SavedPropertyEntity> savedProperties = new HashSet<>();

    @OneToMany(
            mappedBy = "author",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<CommentEntity> comments = new HashSet<>();


    @OneToMany(
            mappedBy = "recipient",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<NotificationEntity> notifications = new HashSet<>();



}















