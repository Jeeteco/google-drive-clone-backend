const supabase =require('../config/supabaseClient.js');

const authMiddleware = async (req, res, next) => {
    // Get the JWT from the Authorization header, e.g., "Bearer [token]"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase to get the user object
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    
    // Attach the authenticated user object to the request for the controller
    req.user = user;
    next();
};

module.exports = {authMiddleware};