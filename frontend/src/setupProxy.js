const { createProxyMiddleware } = require('http-proxy-middleware');
//Proxy middleware for frontend to backend requests
module.exports = function(app){
    app.use('/load',createProxyMiddleware({target:'http://localhost:9000/',changeOrigin: true,}))
    app.use('/user/account',createProxyMiddleware({target:'http://localhost:9000/',changeOrigin: true,}))
    app.use('/info',createProxyMiddleware({target:'http://localhost:9000/',changeOrigin: true,}))
    app.use('/news',createProxyMiddleware({target:'http://localhost:9000/',changeOrigin: true,}))
}
