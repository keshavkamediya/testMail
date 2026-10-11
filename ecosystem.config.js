module.exports = {
  apps: [
    {
      name: 'phonemail',
      script: './server.js',
      instances: 'max', // or 1 for single instance
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '300M',
      time: true
    }
  ]
};
