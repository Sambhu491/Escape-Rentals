package com.fullstack.escape_rentals.comment.entity;

// Computed per-response (not persisted) so the frontend can label a comment's
// author distinctly from a review's author, per role AND stay-verification status.
// Reviews are always effectively VERIFIED_GUEST since ReviewValidator already
// requires a COMPLETED booking before a review can be created — comments have
// no such requirement, so they need this to tell the two apart in the UI.
public enum AuthorBadge {
    VERIFIED_GUEST, // has a COMPLETED booking for this property
    HOST,           // is this property's host
    MEMBER          // any other authenticated account
}
