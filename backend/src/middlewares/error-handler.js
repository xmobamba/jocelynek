export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ressource non trouvée : ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  const details = err.details || undefined;

  req.log.error({ err }, message);

  res.status(status).json({
    status: 'error',
    message,
    details
  });
};
