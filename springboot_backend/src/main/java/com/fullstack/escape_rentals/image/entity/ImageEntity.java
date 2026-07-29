package com.fullstack.escape_rentals.image.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageEntity extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, unique = true, length = 255)
    private String publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="property_id", nullable = false)
    private PropertyEntity property;
}
