package com.fullstack.escape_rentals.comment.mapper;

import com.fullstack.escape_rentals.comment.dto.request.CreateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.response.CommentResponse;
import com.fullstack.escape_rentals.comment.entity.AuthorBadge;
import com.fullstack.escape_rentals.comment.entity.CommentEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentEntity toEntity(
            CreateCommentRequest request,
            PropertyEntity property,
            UserEntity author,
            CommentEntity parent
    ) {
        return CommentEntity.builder()
                .property(property)
                .author(author)
                .parent(parent)
                .content(request.getContent())
                .build();
    }

    // badge and replyCount are computed by the service (they need repository
    // lookups the mapper itself has no business making — keeps this pure).
    public CommentResponse toResponse(CommentEntity comment, AuthorBadge badge, long replyCount) {
        return CommentResponse.builder()
                .id(comment.getId())
                .propertyId(comment.getProperty() != null ? comment.getProperty().getId() : null)
                .propertyTitle(comment.getProperty() != null ? comment.getProperty().getTitle() : null)
                .authorId(comment.getAuthor() != null ? comment.getAuthor().getId() : null)
                .authorName(
                        comment.getAuthor() != null
                                ? comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName()
                                : null
                )
                .authorRole(comment.getAuthor() != null ? comment.getAuthor().getRole() : null)
                .authorBadge(badge)
                .content(comment.getContent())
                .parentCommentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replyCount(replyCount)
                .deleted(comment.isDeleted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
