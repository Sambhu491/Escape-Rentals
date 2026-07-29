package com.fullstack.escape_rentals.image.serviceImpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.InternalServerException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.image.dto.response.ImageResponse;
import com.fullstack.escape_rentals.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    private static final int MAX_IMAGES = 10;
    private static final long MAX_FILE_SIZE = 3 * 1024 * 1024;

    private static final List<String> ALLOWED_TYPES  = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image cannot be empty.");
        }
        if (file.getContentType() == null ||
                !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException(
                    "Image size cannot exceed 3 MB."
            );
        }
    }

    private ImageResponse uploadSingleImage(MultipartFile file) {
        validateFile(file);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.emptyMap()
            );
            return ImageResponse.builder()
                    .imageUrl(result.get("secure_url").toString())
                    .publicId(result.get("public_id").toString())
                    .build();

        } catch (IOException e) {
            throw new InternalServerException(
                    "Failed to upload image.",
                    e
            );
        }
    }

    @Override
    public List<ImageResponse> uploadImages(List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            throw new BadRequestException(
                    "At least one image is required."
            );
        }

        if (files.size() > MAX_IMAGES) {
            throw new BadRequestException(
                    "Maximum " + MAX_IMAGES + " images are allowed."
            );
        }

        List<ImageResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(uploadSingleImage(file));
        }
        return responses;
    }


    @Override
    public void delete(String publicId) {

        if (publicId == null || publicId.isBlank()) {
            throw new BadRequestException(
                    "Public ID cannot be null or empty"
            );
        }

        try {

            Map<?, ?> deleteResult = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

            String result = String.valueOf(deleteResult.get("result"));

            switch (result) {

                case "ok":
                    return;
                case "not_found":
                    throw new ResourceNotFoundException(
                            "Image not found: " + publicId
                    );
                default:
                    throw new InternalServerException(
                            "Cloudinary deletion failed: " + result
                    );
            }

        } catch (IOException e) {

            throw new InternalServerException(
                    "Failed to delete image from Cloudinary.",e
            );
        }
    }

}
