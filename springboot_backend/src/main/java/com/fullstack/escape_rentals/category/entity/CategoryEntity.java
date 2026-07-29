package com.fullstack.escape_rentals.category.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryEntity extends BaseEntity {

    @Column(nullable = false,unique = true, length = 50)
    private String name;

    @Column(length=500)
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
