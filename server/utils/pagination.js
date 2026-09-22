const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = query.page === undefined ? 1 : Number(query.page);

  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw createBadRequestError(
      "page 1 yoki undan katta butun son bo'lishi kerak.",
    );
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw createBadRequestError(
      `limit 1 va ${maxLimit} oralig'idagi butun son bo'lishi kerak.`,
    );
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
