import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',  // Fix typo, should be "reconnectionAttempts"
        timeout: 10000,
        transports: ['websocket'],
    };

    // Ensure REACT_APP_BACKEND_URL is set in your .env file
    return io(process.env.REACT_APP_BACKEND_URL, options);
};