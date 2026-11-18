const sendData = (res, statusCode, data, meta) => {
  const response = { data };
  if (meta !== undefined) response.meta = meta;
  return res.status(statusCode).json(response);
};

export { sendData };
