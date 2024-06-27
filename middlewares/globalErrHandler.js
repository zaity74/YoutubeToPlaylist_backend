export const globalErrHandler = (err, req, res, next) => {
    // stack 
    // message 
    const stack = err?.stack;
    const statusCode = err?.statusCode ? err?.statusCode : 500;
    const message = err?.message;
    console.log("🚀 ~ file: globaleErrHandler.js:7 ~ globalErrHandler ~ message:", message)
  
    return res.status(statusCode).json({
      stack,
      message,
    });
  };

// In case the link enter in the url is not found
export const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;  // Set a 404 status on the error
    next(error);  // Pass the error to the next middleware
};