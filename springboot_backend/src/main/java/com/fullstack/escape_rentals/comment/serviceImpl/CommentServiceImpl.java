package com.fullstack.escape_rentals.comment.serviceImpl;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.comment.dto.request.CreateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.request.UpdateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.response.CommentResponse;
import com.fullstack.escape_rentals.comment.entity.AuthorBadge;
import com.fullstack.escape_rentals.comment.entity.CommentEntity;
import com.fullstack.escape_rentals.comment.mapper.CommentMapper;
import com.fullstack.escape_rentals.comment.repository.CommentRepository;
import com.fullstack.escape_rentals.comment.service.CommentService;
import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final CommentMapper commentMapper;
    private final InAppNotificationService inAppNotificationService;

    private AuthorBadge computeBadge(PropertyEntity property, UserEntity author) {
        if (property.getHost() != null && property.getHost().getId().equals(author.getId())) {
            return AuthorBadge.HOST;
        }

        boolean completedStay = bookingRepository.existsByGuestIdAndPropertyIdAndStatus(
                author.getId(),
                property.getId(),
                BookingStatus.COMPLETED
        );

        return completedStay ? AuthorBadge.VERIFIED_GUEST : AuthorBadge.MEMBER;
    }

    @Override
    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, CustomUserDetails currentUser) {

        PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        UserEntity author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CommentEntity parent = null;
        if (request.getParentCommentId() != null) {
            parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

            if (!parent.getProperty().getId().equals(property.getId())) {
                throw new BadRequestException("Comment does not belong to this property");
            }

            // Instagram/Facebook-style: only one level of nesting — replying to a
            // reply attaches the new comment to the original top-level comment instead.
            if (parent.getParent() != null) {
                parent = parent.getParent();
            }
        }

        CommentEntity entity = commentMapper.toEntity(request, property, author, parent);
        CommentEntity saved = commentRepository.save(entity);

        if (parent != null && parent.getAuthor() != null && !parent.getAuthor().getId().equals(author.getId())) {
            inAppNotificationService.notify(
                    parent.getAuthor(),
                    NotificationType.COMMENT_REPLY,
                    "New reply to your comment",
                    author.getFirstName() + " replied to your comment on \"" + property.getTitle() + "\".",
                    parent.getId()
            );
        }

        return commentMapper.toResponse(saved, computeBadge(property, author), 0);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getPropertyComments(Long propertyId, Pageable pageable) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found");
        }

        return commentRepository.findByPropertyIdAndParentIsNullAndDeletedFalse(propertyId, pageable)
                .map(c -> commentMapper.toResponse(
                        c,
                        computeBadge(c.getProperty(), c.getAuthor()),
                        commentRepository.countByParentIdAndDeletedFalse(c.getId())
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getReplies(Long commentId) {

        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found");
        }

        return commentRepository.findByParentIdAndDeletedFalseOrderByCreatedAtAsc(commentId).stream()
                .map(c -> commentMapper.toResponse(c, computeBadge(c.getProperty(), c.getAuthor()), 0))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getAllCommentsForAdmin(Pageable pageable) {
        return commentRepository.findAll(pageable)
                .map(c -> commentMapper.toResponse(
                        c,
                        computeBadge(c.getProperty(), c.getAuthor()),
                        c.getParent() == null ? commentRepository.countByParentIdAndDeletedFalse(c.getId()) : 0
                ));
    }

    @Override
    @Transactional
    public CommentResponse restoreComment(Long id, CustomUserDetails currentUser) {

        if (currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only admins can restore a comment.");
        }

        CommentEntity comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        comment.setDeleted(false);
        CommentEntity saved = commentRepository.save(comment);

        long replyCount = saved.getParent() == null ? commentRepository.countByParentIdAndDeletedFalse(saved.getId()) : 0;

        return commentMapper.toResponse(saved, computeBadge(saved.getProperty(), saved.getAuthor()), replyCount);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Long id, UpdateCommentRequest request, CustomUserDetails currentUser) {

        CommentEntity comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = comment.getAuthor().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Not allowed to edit this comment");
        }

        comment.setContent(request.getContent());
        CommentEntity saved = commentRepository.save(comment);

        long replyCount = saved.getParent() == null ? commentRepository.countByParentIdAndDeletedFalse(saved.getId()) : 0;

        return commentMapper.toResponse(saved, computeBadge(saved.getProperty(), saved.getAuthor()), replyCount);
    }

    @Override
    @Transactional
    public void deleteComment(Long id, CustomUserDetails currentUser) {

        CommentEntity comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isPropertyHost = comment.getProperty().getHost() != null
                && comment.getProperty().getHost().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner && !isPropertyHost) {
            throw new AccessDeniedException("Not allowed to delete this comment");
        }

        // Admin deletes are final. An author removing their own comment is also
        // final — it's their content, no moderation dispute involved. A host
        // moderating someone else's comment on their property is a soft delete:
        // it disappears from public view but stays recoverable by an admin.
        if (isPropertyHost && !isOwner && !isAdmin) {
            comment.setDeleted(true);
            commentRepository.save(comment);
            return;
        }

        commentRepository.delete(comment);
    }
}
