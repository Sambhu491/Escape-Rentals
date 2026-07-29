package com.fullstack.escape_rentals.saved.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

// One row per (user, property) bookmark. Deliberately no back-reference
// collection on PropertyEntity/UserEntity — a wishlist is looked up from the
// user's side only, so it doesn't need to touch either of those entities.
@Entity
@Table(
        name = "saved_properties",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "property_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPropertyEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;
}
