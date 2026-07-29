package com.fullstack.escape_rentals.image.service;

import com.fullstack.escape_rentals.image.dto.response.ImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {
    List<ImageResponse> uploadImages(List<MultipartFile> files);
    void delete(String publicId);
}
