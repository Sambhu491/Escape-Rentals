# Escape Rentals

## Project Overview

Escape Rentals is a full-stack property rental marketplace. The application provides a complete rental ecosystem where users can discover and search properties, manage there bookings, make payments, leave reviews comments and raise report flags on suspicious malicious properties. Property owners can create and manage their listings, Add/Edit/Delete there properties, Upload property images, bookings etc. A onwer have options to choose auto and manaul booking confirmation for ther property, While administrators can monitor platform activity, moderate content, and manage users/owner/etc. Provided with email and In-App notifications for every activity done by the platform users.

---

## Live Demo (Website)

Visit the live application here:

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://escape-rentals.vercel.app/)

Or open it from below link:

https://escape-rentals.vercel.app/

---

## Features

### Authentication & User Management
- Role-Based Authentication with different user permissions
- Secure JWT-based authentication
- User registration and login system
- OTP verification for account security
- Forgot password and password reset functionality
- Personal profile management
- Account status management
- Profile Update

### Property Management
- Create, update, and delete property listings
- Upload and manage property images
- Property categorization
- Property search and filtering
- Property availability management
- Property status tracking
- Host property dashboard
- Property-related notifications

### Booking System
- Property booking workflow
- Booking creation and management
- Booking status tracking
- Booking validation and conflict prevention
- Host approval/rejection management
- Booking-related notifications

### Online Payments
- Integrated Razorpay payment gateway
- Secure payment verification
- Payment status tracking
- Payment history management
- Payment-related notifications

### Communication & Notifications
- Email notifications using SMTP
- In-app notification system
- Booking confirmation emails
- Payment confirmation emails
- OTP emails
- Anonymous contact support
- Mail-based communication support

### Reviews & Comments
- Users can review booked properties
- Review moderation system
- Comment functionality
- Comment Reply Functionality
- Review replies
- Review concern reporting For Host
- Review action appeal to admin by Host

### Security & Moderation
- Role-based access control
- JWT security implementation
- Admin moderation tools
- Fraud and abuse reporting system
- User reporting functionality
- Protected API endpoints

### Wishlist / Saved Properties
- Save favorite properties
- Manage saved listings
- Quick access to preferred properties

### Dashboards
- User dashboard
- Host dashboard
- Admin dashboard
- Property statistics
- Booking insights
- User activity monitoring

### Admin Features
- User management
- Property moderation
- Category management
- Comment moderation
- Review moderation
- Report handling
- Platform monitoring

---

## Tech Stack

### Frontend
- React Js
- Vite
- Tailwind CSS
- Formik
- Yup (Validation)
- React Router DOM
- Redux Toolkit
- React-Icons
- Axios

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Hibernate / JPA
- MySQL
- Maven

### External Services
- Razorpay (Payment Gateway)
- Cloudinary (Image Storage)
- Gmail SMTP (Email Services)

---
## Project Structure

```
Escape-Rentals/
│
├── react_frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── dataFile/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
│
└── springboot_backend/
    │
    ├── src/
    │   └── main/
    │       └── java/
    │           └── com/
    │               └── fullstack/
    │                   └── escape_rentals/
    │                       │
    │                       ├── auth/
    │                       ├── booking/
    │                       ├── category/
    │                       ├── comment/
    │                       ├── common/
    │                       ├── config/
    │                       ├── dashboard/
    │                       ├── exception/
    │                       ├── image/
    │                       ├── notification/
    │                       ├── otp/
    │                       ├── payment/
    │                       ├── property/
    │                       ├── report/
    │                       ├── review/
    │                       ├── saved/
    │                       ├── security/
    │                       ├── user/
    │                       └── userreport/
    │
    ├── pom.xml
    └── mvnw
```

## Installation & Setup

### Prerequisites

Make sure you have installed:

- React Js
- Vite
- Node.js
- Java JDK 17+
- Maven
- MySQL Database

---

### Clone Repository

```bash
git clone https://github.com/Sambhu491/Escape-Rentals/tree/main
```

---

## Future Improvements

- AI-powered chatbot for property assistance and customer support
- Cookie-based authentication and session management improvements
- Automated PDF receipt generation and download system
- Advanced property recommendation system
- Location-based property search using maps integration
- Real-time chat between users and property owners
- Enhanced fraud detection using machine learning
- Mobile application development
- Multi-language support
- Improved analytics and reporting features
- Advanced search filters and personalized recommendations

---



## License 

This project is licensed under the MIT License.



## About

Escape Rentals is a full-stack rental marketplace project developed to demonstrate modern web application architecture using React.js, Spring Boot, and MySQL.

The project focuses on secure authentication, scalable backend architecture, payment integration, user interaction, and real-world rental management workflows.

---

## Contributions

If you would like to improve this project, please follow these steps:

### 1. Fork the repository

Fork this repository to your GitHub account.

### 2. Create a new branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

Implement your improvements, bug fixes, or new features.

### 4. Commit your changes

```bash
git add .
git commit -m "Add new feature"
```

### 5. Push the branch

```bash
git push origin feature/new-feature
```

### 6. Open a Pull Request

Submit a Pull Request with a clear description of your changes.

--- 

Please feel free to contribute to this project by submitting issues or pull requests.
Any enhancements, bug fixes, or optimizations are extremely welcomed!



