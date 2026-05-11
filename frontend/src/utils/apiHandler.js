// src/utils/apiHandler.js

export const handleRequest = async (request) => {
    try {
        const response = await request();

        // Standard response handling
        return response?.data?.data ?? response?.data;

    } catch (error) {
        // Extract meaningful error message
        const message =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Something went wrong';

        throw new Error(message);
    }
};