export const getRequestParams = (req) => {
  const month = req.query.month === 'all' ? 'all' : parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = req.query.year === 'all' ? 'all' : parseInt(req.query.year) || new Date().getFullYear();
  const userId = req.user?._id;
  return { month, year, userId };
};
