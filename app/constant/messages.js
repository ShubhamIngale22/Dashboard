module.exports = {
    // General
    SERVER_ERROR: "Internal server error",
    BAD_REQUEST: "Invalid request data",

    // User
    USER_NOT_FOUND: "User not found",
    USER_CREATED: "User created successfully",
    USER_DELETED: "User deleted successfully",

    // Validation
    NAME_REQUIRED: "Name is required",
    NAME_MIN_LENGTH: "Name must be at least 3 characters",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Invalid email format",
    EMAIL_EXISTS:"Email is already existing",
    PHONE_REQUIRED: "Phone is required",
    PHONE_INVALID: "Phone must be 10 digits",
    PHONE_EXISTS:"Phone number already exists",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",

    // Auth (future)
    INVALID_CREDENTIALS: "Invalid email or password",

    EMPTY_STRING: 'Some required fields are missing.'
};
