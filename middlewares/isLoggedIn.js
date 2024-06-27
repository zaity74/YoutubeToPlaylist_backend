import { getTokenFromHeader } from "../utils/generateToken.js";
import { verifyToken } from "../utils/verifyToken.js";

// Middleware to check if the user is loggedIn before access to profile
const isLoggedIn = (req, res, next) => {
    // check token is in header 
    const token = getTokenFromHeader(req);

    // verify the token
    const decodedUser = verifyToken(token);

    // check if decoded is valid if yes save the user in req.object
    if (!decodedUser) {
        throw new Error('invalid/expired token, please log in');
    } else {
        req.userAuthId = decodedUser?.id;
        next();
    }
}

export default isLoggedIn;
