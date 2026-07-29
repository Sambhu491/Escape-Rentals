package com.fullstack.escape_rentals.image.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageResponse {

    private String imageUrl;

    private String publicId;

}