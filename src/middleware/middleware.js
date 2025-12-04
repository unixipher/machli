const error = (err, res) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
};


export {
    error,
    notFound
};