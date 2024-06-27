import jwt from 'jsonwebtoken';


const generateToken = (id) => {
    // the id is a reference to the user
    // after the id, is a key, wich is a signature of the token 
    // expire date
    return jwt.sign({id},process.env.JWT_KEY,{expiresIn: '3d'})
}

export default generateToken

export const getTokenFromHeader = (req) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        return null;  // Pas de token trouvé
    }
    const token = authHeader.split(' ')[1];
    if (token === 'undefined') {
        console.log('find auth token');
        return null;  // Token non valide
    } else {
        return token;
    }
}