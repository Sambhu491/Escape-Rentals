package com.fullstack.escape_rentals.property.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyImageResponse {
    private Long id;
    private String imageUrl;
    private String publicId;
}