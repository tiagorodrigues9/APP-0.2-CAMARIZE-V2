const noStore = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

const cacheControl = (maxAge, swrMaxAge = 0) => (req, res, next) => {
  const directive = swrMaxAge > 0
    ? `private, max-age=${maxAge}, stale-while-revalidate=${swrMaxAge}`
    : `private, max-age=${maxAge}`;
  res.set('Cache-Control', directive);
  res.set('Vary', 'Authorization');
  next();
};

export default { cacheControl, noStore };
