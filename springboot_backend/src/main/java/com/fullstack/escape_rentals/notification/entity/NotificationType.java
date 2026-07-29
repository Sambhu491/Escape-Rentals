package com.fullstack.escape_rentals.notification.entity;

// Deliberately kept a plain flat list rather than one enum per feature, since
// this is the lightweight scaffold requested — just enough to categorize and
// later filter/icon-match notifications in the UI, not a full event system.
public enum NotificationType {
    BOOKING,
    PAYMENT,
    REVIEW,
    REVIEW_REPLY,
    REVIEW_CONCERN,
    REPORT,
    USER_REPORT,
    COMMENT_REPLY,
    CONTACT
}
