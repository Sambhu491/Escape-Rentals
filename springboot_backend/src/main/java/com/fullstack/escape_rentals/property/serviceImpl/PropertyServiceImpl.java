package com.fullstack.escape_rentals.property.serviceImpl;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import com.fullstack.escape_rentals.category.repository.CategoryRepository;
import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.image.dto.response.ImageResponse;
import com.fullstack.escape_rentals.image.entity.ImageEntity;
import com.fullstack.escape_rentals.image.repository.ImageRepository;
import com.fullstack.escape_rentals.image.service.ImageService;
import com.fullstack.escape_rentals.property.dto.request.CreatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.request.PropertyFilterRequest;
import com.fullstack.escape_rentals.property.dto.request.UpdatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.response.AvailabilityResponse;
import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import com.fullstack.escape_rentals.property.mapper.PropertyMapper;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.property.service.PropertyService;
import com.fullstack.escape_rentals.property.specification.PropertySpecification;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PropertyMapper propertyMapper;
    private final ReviewRepository reviewRepository;
    private final ImageService imageService;
    private final ImageRepository imageRepository;
    private final BookingRepository bookingRepository;

    private static final int MAX_IMAGES = 10;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private PropertyResponse mapPropertyWithRating(PropertyEntity property) {
        PropertyResponse response = propertyMapper.toPropertyResponse(property);

        Double averageRating =
                reviewRepository.findAverageRating(property.getId());

        Long reviewCount =
                reviewRepository.countByPropertyId(property.getId());

        response.setAverageRating(
                averageRating != null ? averageRating : 0.0
        );

        response.setReviewCount(
                reviewCount != null ? reviewCount : 0L
        );
        return response;
    }

    private void deleteUploadedImages(List<ImageResponse> uploadedImages) {
        for (ImageResponse img : uploadedImages) {
            try {
                imageService.delete(img.getPublicId());
            } catch (RuntimeException cleanupEx) {
                // best-effort cleanup; don't mask the original failure
                log.error("Failed to delete orphaned Cloudinary image {}",
                        img.getPublicId(), cleanupEx);
            }
        }
    }


    @Override
    public PropertyResponse createProperty(
            CreatePropertyRequest request,
            List<MultipartFile> images ,
            Long hostId){
        UserEntity host = userRepository.findById(hostId)
                .orElseThrow(()->new ResourceNotFoundException(("Host not found")));

        if(host.getRole() != Role.ROLE_HOST
                && host.getRole() != Role.ROLE_ADMIN){

            throw new AccessDeniedException(
                    "Only hosts can create properties"
            );
        }
        CategoryEntity category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                .orElseThrow(()->new ResourceNotFoundException("Category not found"));

        boolean exists = propertyRepository.existsByTitleAndHostIdAndDeletedFalse(request.getTitle(),hostId);

        if(exists) {
            throw new DuplicateResourceException("Property with same title already exists for this host");
        }

        if (!category.isActive()) {
            throw new BadRequestException("Selected category is inactive");
        }

        for(MultipartFile file : images) {
            if(file.isEmpty()) {
                throw new BadRequestException("One or more uploaded images are empty");
            }

            if(file.getSize() > MAX_FILE_SIZE) {
                throw new BadRequestException(
                        "Image '"+ file.getOriginalFilename()+"' exceeds the maximum allowed size of 5 MB"
                );
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException(
                        "File '" + file.getOriginalFilename() + "' is not a valid image format"
                );
            }
        }

        PropertyEntity property = propertyMapper.toPropertyEntity(request,host,category);
        List<ImageResponse> uploadedImages = imageService.uploadImages(images);

        try {
            List<ImageEntity> imageEntities = uploadedImages
                    .stream().map(
                            image ->
                                    ImageEntity.builder()
                                            .imageUrl(image.getImageUrl())
                                            .publicId(image.getPublicId())
                                            .property(property)
                                            .build()
                    ).toList();

            property.setImages(imageEntities);

            property.setStatus(PropertyStatus.AVAILABLE);
            PropertyEntity saved = propertyRepository.save(property);
            return propertyMapper.toPropertyResponse(saved);

        } catch (RuntimeException ex) {
            deleteUploadedImages(uploadedImages);
            throw ex;
        }

    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long id){
        PropertyEntity property = propertyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(()->new ResourceNotFoundException("Property not found"));
        return mapPropertyWithRating(property);
    }

    // =========================
    // SEARCH FILTERED PROPERTIES
    // =========================
    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getPropertiesByFilter(
            PropertyFilterRequest filter,
            Pageable pageable
    ){
        if (filter.getMinPrice() != null &&
                filter.getMaxPrice() != null &&
                filter.getMinPrice().compareTo(filter.getMaxPrice()) > 0) {

            throw new BadRequestException("Invalid price range: minPrice cannot be greater than maxPrice");
        }

        if ((filter.getCheckInDate() == null) != (filter.getCheckOutDate() == null)) {
            throw new BadRequestException(
                    "Both checkInDate and checkOutDate are required to filter by availability");
        }

        if (filter.getCheckInDate() != null
                && !filter.getCheckInDate().isBefore(filter.getCheckOutDate())) {
            throw new BadRequestException(
                    "Invalid date range: checkInDate must be before checkOutDate");
        }


        Specification<PropertyEntity> spec = Specification
                .where(PropertySpecification.onlyActiveListings())
                .and(PropertySpecification.hasCity(filter.getCity()))
                .and(PropertySpecification.hasState(filter.getState()))
                .and(PropertySpecification.hasCountry(filter.getCountry()))
                .and(PropertySpecification.hasCategory(filter.getCategoryId()))
                .and(PropertySpecification.hasGuestCapacity(filter.getMaxGuests()))
                .and(PropertySpecification.hasBedrooms(filter.getBedrooms()))
                .and(PropertySpecification.hasStatus(filter.getStatus()))
                .and(PropertySpecification.hasPriceBetween(
                        filter.getMinPrice(),
                        filter.getMaxPrice()
                ))
                .and(
                        PropertySpecification.isAvailable(
                                filter.getCheckInDate(),
                                filter.getCheckOutDate()
                        )
                );

        return propertyRepository.findAll(spec, pageable)
                .map(this::mapPropertyWithRating);
    }

    // =========================
    // DEFAULT LIST (HOMEPAGE)
    // =========================
    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getAllProperties(Pageable pageable){
        return propertyRepository.findAll(
                PropertySpecification.onlyActiveListings(),
                pageable)
                .map(this::mapPropertyWithRating);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getPropertiesByHostId(Long currentHostId){
        List<PropertyEntity> properties = propertyRepository.findAllByHostIdAndDeletedFalse(currentHostId);
        return properties.stream()
                .map(this::mapPropertyWithRating)
                .toList();
    }

    // =========================
    // UPDATE PROPERTY
    // =========================
    @Override
    public PropertyResponse updateProperty(Long id, UpdatePropertyRequest request, CustomUserDetails userDetails) {

        PropertyEntity property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;

        if (!property.getHost().getId().equals(userDetails.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access Denied! You don't own this property.");
        }

        if(request.getStatus() != null){
            if(request.getStatus() == PropertyStatus.AVAILABLE
                    && property.isDeleted()){
                throw new BadRequestException(
                        "Deleted property cannot be made available"
                );
            }
            property.setStatus(request.getStatus());
        }

        if(request.getBookingApprovalType() != null){
            property.setBookingApprovalType(
                    request.getBookingApprovalType()
            );
        }

        if(request.getTitle() != null && !request.getTitle().equals(property.getTitle())) {
            boolean exists = propertyRepository.existsByTitleAndHostIdAndIdNot(
                    request.getTitle(),
                    property.getHost().getId(),
                    property.getId()
            );
            if (exists) {
                throw new DuplicateResourceException(
                        "Property with the same title already exists for this host."
                );
            }
        }

        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            property.setCategory(category);
        }

        propertyMapper.updatePropertyEntity(property, request);

        PropertyEntity updated = propertyRepository.save(property);

        return propertyMapper.toPropertyResponse(updated);
    }



    @Override
    public void deleteProperty(Long id, CustomUserDetails userDetails) {

        PropertyEntity property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = property.getHost().getId().equals(userDetails.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Not allowed to delete this property");
        }

        // Delete Cloudinary images first
        if (property.getImages() != null) {
            for (ImageEntity image : property.getImages()) {
                try {
                    imageService.delete(image.getPublicId());
                } catch (RuntimeException ex) {
                    log.error(
                            "Failed deleting image {}",
                            image.getPublicId(),
                            ex
                    );
                }
            }
        }
        // Delete property completely
        propertyRepository.delete(property);
    }



    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getAllPropertiesForAdmin(Pageable pageable){

        return propertyRepository.findAll(pageable)
                .map(propertyMapper::toPropertyResponse);
    }

    @Override
    public PropertyResponse addPropertyImages(
            Long propertyId,
            List<MultipartFile> images,
            CustomUserDetails userDetails
    ) {
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;

        if ((property.getImages().size() + images.size()) > MAX_IMAGES) {
            throw new BadRequestException("Total images cannot exceed " + MAX_IMAGES);
        }

        if (!property.getHost().getId().equals(userDetails.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access Denied! You don't own this property.");
        }

        List<ImageResponse> uploadImages = imageService.uploadImages(images);

        try {
            for(ImageResponse img : uploadImages)  {
                ImageEntity imgEntity = ImageEntity.builder()
                        .imageUrl(img.getImageUrl())
                        .publicId(img.getPublicId())
                        .property(property)
                        .build();
                imageRepository.save(imgEntity);
                property.getImages().add(imgEntity);
            }
            return mapPropertyWithRating(property);

        } catch (RuntimeException ex) {
            deleteUploadedImages(uploadImages);
            throw ex;
        }
    }


    @Override
    public void deletePropertyImage(
            Long propertyId,
            Long imageId,
            CustomUserDetails userDetails
    ) {
        PropertyEntity property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;

        if (!property.getHost().getId().equals(userDetails.getId()) && !isAdmin) {
            throw new AccessDeniedException("Access Denied! You don't own this property.");
        }

        ImageEntity deleteImg = imageRepository.findByIdAndPropertyId(imageId,propertyId)
                .orElseThrow(()->new ResourceNotFoundException("Image Not Found For This Property"));

        try{
            imageService.delete(deleteImg.getPublicId());
            imageRepository.delete(deleteImg);
            property.getImages().remove(deleteImg);
        } catch (Exception e) {
            throw new BadRequestException("Images Not Got Deleted. Try Again!");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getPropertyAvailability(
            Long propertyId,
            LocalDate from,
            LocalDate to
    ) {

        if (from == null || to == null) {
            throw new BadRequestException("Both 'from' and 'to' dates are required");
        }

        if (!from.isBefore(to)) {
            throw new BadRequestException(
                    "Invalid date range: 'from' must be before 'to'");
        }

        PropertyEntity property = propertyRepository
                .findByIdAndDeletedFalse(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found"
                        )
                );

        if (property.isDeleted()) {
            throw new ResourceNotFoundException("Property not found");
        }

        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new BadRequestException("Property is not available");
        }

        List<BookingEntity> bookings =
                bookingRepository.findByPropertyIdAndStatusIn(
                        propertyId,
                        List.of(
                                BookingStatus.CONFIRMED,
                                BookingStatus.PENDING
                        )
                );


        return bookings.stream()
                .filter(booking ->
                        !booking.getCheckOutDate().isBefore(from)
                                &&
                                !booking.getCheckInDate().isAfter(to)
                )
                .map(booking ->
                        AvailabilityResponse.builder()
                                .checkInDate(
                                        booking.getCheckInDate()
                                )
                                .checkOutDate(
                                        booking.getCheckOutDate()
                                )
                                .build()
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableCities() {
        return propertyRepository.findDistinctCities();
    }

}
