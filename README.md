# Class Registration and Recommendation API Service

## Overview

The Fitness API Service is a RESTful API designed to manage a fitness center's operations, including handling coaches, fitness classes, user registrations, and secure user authentication. This API, built using FastAPI, now incorporates advanced features like role-based access control and secure password handling, enhancing the security and functionality of the system.

## Features

- **User Authentication**: Secure user authentication using JWT tokens.
- **Role-Based Access Control**: Different access levels for users like 'admin' and 'regular' users.
- **Coaches Management**: Add new coaches, retrieve coach details, update coach information, and delete coaches from the system.
- **Fitness Classes Management**: Manage fitness class schedules, including adding new classes, updating class details, and deleting classes.
- **User Registrations**: Handle user registrations for fitness classes, allowing users to sign up for classes and retrieve their registration details.
- **Secure Password Handling**: Passwords are securely hashed using bcrypt, ensuring sensitive data protection.
  
## Authentication

The API implements a secure authentication system using JWT (JSON Web Tokens) to manage user access. This system allows for secure transmission of information and ensures that only authenticated users can access certain endpoints.

### Authentication Process

- **User Registration (`POST /signup`)**: Users can register by providing a username, password, and role. The password is securely hashed before storage.
- **User Login (`POST /login`)**: Upon login, users receive a JWT token that must be used in the Authorization header for accessing protected endpoints.
- **Token Verification**: Each request to a protected endpoint requires a valid JWT token. The token is verified for its integrity and expiration.

### Token Model

- `access_token`: The JWT token used for authentication.
- `token_type`: The type of the token, typically "bearer".

## Roles

Role-based access control (RBAC) is implemented to provide different levels of access to the API based on user roles. This ensures that users can only perform actions that are appropriate for their level of access.

### Defined Roles

- **Admin**: Has full access to all API endpoints, including creating, updating, and deleting coaches, classes, and managing user roles.
- **User**: Limited access, typically restricted to viewing information and registering for classes.

### Role Enforcement

- Role checks are performed on relevant endpoints to ensure that the user has the appropriate permissions.
- For example, only admins can add or delete coaches, while regular users can only view coach information and register for classes.

This role-based system enhances the security and integrity of the API by ensuring that users can only perform actions within their permitted scope.

## How to Use

### Prerequisites

- Python 3.6+
- FastAPI
- Uvicorn (for running the API server)
- Passlib, bcrypt (for password hashing)
- PyJWT (for JWT token handling)

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

#### General

- `GET /`: The root endpoint, which returns a welcome message.

#### Authentication

- `POST /signup`: Register a new user.
- `POST /login`: Authenticate a user and receive an access token.

#### Coaches

- `GET /coaches`: Retrieve a list of all coaches.
- `POST /coaches`: Add a new coach to the system.
- `PUT /coaches/{coach_id}`: Update the information of a specific coach.
- `DELETE /coaches/{coach_id}`: Remove a coach from the system.

#### Fitness Classes

- `GET /classes`: Get a list of all fitness classes.
- `POST /classes`: Schedule a new fitness class.
- `PUT /classes/{class_id}`: Update details of a specific fitness class.
- `DELETE /classes/{class_id}`: Cancel a fitness class.

#### Registrations

- `POST /register`: Register a user for a fitness class.
- `GET /registrations`: Retrieve all user registrations.

### Models

The API uses Pydantic models to define the structure of the data for coaches, fitness classes, registrations, users, and authentication.

#### Coach Model

- `coach_id`: Unique identifier for the coach.
- `first_name`: Coach's first name.
- `last_name`: Coach's last name.
- `email`: Coach's email address.
- `phone_number`: Coach's contact number.
- `experience_years`: Number of years of coaching experience.
- `hourly_rate_idr`: Hourly rate in Indonesian Rupiah.
- `availability`: Coach's availability.
- `bio`: A short biography of the coach.

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

Data is stored in JSON files (`coaches.json`, `fitness_classes.json`, `registrations.json` , `users_db.json`) and is read and written using utility functions.

## Deployed API Link

The API is deployed and can be accessed at [https://fitness-coaching.azurewebsites.net/](https://fitness-coaching.azurewebsites.net/).

## Contributing

Contributions to the Fitness API Service are welcome. Please follow the standard fork-and-pull request workflow.

## License

This project is unlicensed and available for free use.

---

This README provides a basic introduction to the Fitness API Service. For more detailed documentation on the API endpoints and their usage, refer to the API documentation generated by FastAPI, accessible at the deployed API link [https://fitness-coaching.azurewebsites.net/docs](https://fitness-coaching.azurewebsites.net/docs).

