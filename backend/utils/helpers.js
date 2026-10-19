export const getRequestParams = (req) => {
  let month;
  if (req.query.month === 'all') {
    month = 'all';
  } else {
    const parsedMonth = parseInt(req.query.month, 10);
    month = !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : new Date().getMonth() + 1;
  }

  let year;
  if (req.query.year === 'all') {
    year = 'all';
  } else {
    const parsedYear = parseInt(req.query.year, 10);
    year = !isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
      ? parsedYear
      : new Date().getFullYear();
  }

  // Tenant Isolation: strictly pull authenticated user ID
  const userId = req.user?._id;
  return { month, year, userId };
};
