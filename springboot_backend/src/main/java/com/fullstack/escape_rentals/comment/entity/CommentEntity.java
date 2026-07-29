package com.fullstack.escape_rentals.comment.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

// Any authenticated account can leave a comment (unlike reviews, which require
// a completed/paid stay). Threading is one level deep, Instagram/Facebook-style:
// a comment either has no parent (top-level) or a parent that is itself top-level.
@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private UserEntity author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private CommentEntity parent;

    @Column(nullable = false, length = 1000)
    private String content;

    // Soft-delete: set true when a property's host removes someone else's
    // comment (moderation action, restorable by an admin). An admin's own
    // delete, or the author deleting their own comment, is a hard delete
    // instead — see CommentServiceImpl.deleteComment.
    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<CommentEntity> replies = new HashSet<>();
}
