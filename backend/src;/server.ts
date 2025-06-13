import app, { corsOptions, getAllowedOrigins } from './app';

const PORT = process.env.PORT || 5000;

// Start server using Bun
const server = app.listen(PORT, async () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`⚡ Runtime: Bun ${Bun.version}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/health`);
    console.log(`🍪 Cookies enabled: ${corsOptions.credentials}`);
    console.log(`🔐 CORS configured for: ${getAllowedOrigins().join(', ')}`);
});

export default server;
