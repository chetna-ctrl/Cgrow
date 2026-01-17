/**
 * Supabase helper utilities for error handling and timeouts
 */

/**
 * Wraps a Supabase query with a timeout
 * Prevents indefinite loading states when queries fail or are slow
 * 
 * @param {Promise} promise - The Supabase query promise
 * @param {number} timeout - Timeout in milliseconds (default: 8000ms)
 * @returns {Promise}
 * @throws {Error} When timeout is reached or query fails
 */
export const fetchWithTimeout = async (promise, timeout = 8000) => {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - check your connection and try again')), timeout)
    );

    try {
        return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

/**
 * Safely handles Supabase errors and returns user-friendly messages
 * @param {Error} error - The error object from Supabase
 * @returns {string} User-friendly error message
 */
export const handleSupabaseError = (error) => {
    if (!error) return 'An unknown error occurred';

    // Network errors
    if (error.message?.includes('timeout')) {
        return 'Connection timeout. Please check your internet and try again.';
    }

    if (error.message?.includes('Failed to fetch')) {
        return 'Unable to connect to server. Please check your internet connection.';
    }

    // Auth errors
    if (error.message?.includes('not authenticated')) {
        return 'Please log in to continue.';
    }

    // Default
    return error.message || 'An error occurred. Please try again.';
};
