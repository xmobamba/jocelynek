export const configureCors = () => {
  const origins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*';

  return {
    origin: origins,
    credentials: true,
    optionsSuccessStatus: 200
  };
};
