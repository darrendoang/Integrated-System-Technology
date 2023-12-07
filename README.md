# Class Registration and Recommendation API Service

## Overview

The Fitness API Service is a RESTful API designed to manage a fitness center's operations. Built using FastAPI, it incorporates advanced features like role-based access control and secure password handling, enhancing the system's security and functionality. The API handles coaches, fitness classes, user registrations, and provides secure user authentication.

## Features

- **User Authentication**: Implements JWT token-based secure authentication.
- **Role-Based Access Control**: Admin and regular user roles with distinct access levels.
- **Coaches Management**: Capabilities include adding, retrieving, updating, and deleting coach information.
- **Fitness Classes Management**: Facilitates managing fitness class schedules; adding, updating, and deleting class information.
- **User Registrations**: Manages user registrations for fitness classes with features to sign up and retrieve registration details.
- **Secure Password Handling**: Utilizes bcrypt for secure password hashing.

## Authentication

The API uses JWT for secure user authentication, ensuring safe information transmission and access control to various endpoints.

### Authentication Process

- **User Registration (`POST /signup`)**: New users can register with a username, password, and role. Passwords are securely hashed.
- **User Login (`POST /login`)**: Users receive a JWT token upon login, used for accessing protected endpoints.
- **Token Verification**: Protected endpoints require a valid JWT token for access.

### Token Model

- `access_token`: JWT token for authentication.
- `token_type`: Typically "bearer".

## Roles

The API uses RBAC to provide different access levels:

### Defined Roles

- **Admin**: Full access to all endpoints.
- **User**: Can view information and register for classes.

### Role Enforcement

- Role checks are in place to ensure appropriate access levels are maintained.

## How to Use

### Prerequisites

- Python 3.6+
- FastAPI
- Uvicorn, Passlib, bcrypt, and PyJWT

### Installation

1. Clone the repository to your local machine.
2. Install the required packages using `pip`:

   ```bash
   pip install fastapi uvicorn passlib[bcrypt] python-jose[cryptography]
   ```

### Running the Server

To run the server, use the following command:

```bash
uvicorn main:app --reload
```

The `--reload` flag enables auto-reloading of the server when there are changes to the code.


### API Endpoints

#### Authentication
- `POST /signup`: Register a new user.
- `POST /login`: Login for a user, returning a JWT token for authentication.

#### Coaches Management
- `GET /coaches`: Retrieve a list of all coaches.
- `POST /coaches`: Add a new coach.
- `PUT /coaches/{coach_id}`: Update a coach's details.
- `DELETE /coaches/{coach_id}`: Delete a coach.

#### Fitness Classes Management
- `GET /classes`: Get a list of all fitness classes.
- `POST /classes`: Add a new fitness class.
- `PUT /classes/{class_id}`: Update a fitness class's details.
- `DELETE /classes/{class_id}`: Delete a fitness class.

#### User Registrations
- `POST /register`: Register a user for a class.
- `GET /registrations`: Get a user's registrations.
- `GET /all-registrations`: Get registrations for all users (admin only).
- `DELETE /cancel_registration/{class_id}`: Cancel a user's class registration.

#### User Management (Admin Only)
- `GET /users`: Retrieve all user details.
- `PUT /users/{user_id}`: Update a user's details.
- `DELETE /users/{user_id}`: Delete a user.

#### Utility Endpoints
- `GET /`: Root endpoint, returning a welcome message.
- `GET /current_user`: Get details of the current user.


### Models

The API uses Pydantic models to define data structures for coaches, fitness classes, registrations, and users.

#### Coach Model

- `coach_id`: Unique identifier.
- `first_name`: First name.
- `last_name`: Last name.
- `email`: Email address.
- `phone_number`: Contact number.
- `experience_years`: Coaching experience in years.
- `hourly_rate_idr`: Hourly rate in IDR.
- `availability`: Availability.
- `bio`: Short biography.

#### Fitness Class Model

- `class_id`: Unique identifier for the class.
- `coach_id`: Identifier of the coach conducting the class.
- `start_time`: Start time of the class.
- `end_time`: End time of the class.
- `class_type`: Type of fitness class.

#### Registration Model

- `user_id`: Identifier of the user registering for the class.
- `class_id`: Identifier of the class for which the user is registering.

#### User Model

- `username`: Username of the user.
- `hashed_password`: Hashed password of the user.
- `disabled`: Boolean indicating if the user account is disabled.
- `role`: Role of the user (e.g., admin, user).

#### User Registration Model

- `username`: Username for the new user.
- `password`: Password for the new user.
- `role`: Role of the new user (e.g., admin, user).

#### Token Model

- `access_token`: JWT access token for authentication.
- `token_type`: Type of the token (typically "bearer").

#### User Login Request Model

- `username`: Username of the user trying to log in.
- `password`: Password of the user trying to log in.

### Error Handling

The API uses HTTP status codes to indicate the success or failure of requests:

- `200 OK`: The request was successful.
- `400 Bad Request`: The request was invalid, such as when trying to add a duplicate entry.
- `404 Not Found`: The requested resource was not found.

### Data Storage

Data is stored in JSON files (`coaches.json`, `fitness_classes.json`, `registrations.json`, `users_db.json`) and is read and written using utility functions.

## Deployed API Link

The API is deployed and can be accessed at [https://fitness-coaching.azurewebsites.net/](https://fitness-coaching.azurewebsites.net/).

## Deployed Web Link

The Website is deployed and can be accessed at [https://class-registrations.netlify.app/](https://class-registrations.netlify.app/).

## Contributing

Contributions to the Fitness API Service are welcome. Please follow the standard fork-and-pull request workflow.

## License

This project is unlicensed and available for free use.

---

This README provides a basic introduction to the Fitness API Service. For more detailed documentation on the API endpoints and their usage, refer to the API documentation generated by FastAPI, accessible at the deployed API link [https://fitness-coaching.azurewebsites.net/docs](https://fitness-coaching.azurewebsites.net/docs).

