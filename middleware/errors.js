const errorHandler = (err, req, res, next) => {
  console.error(" Ошибка сервера:", err.stack);
  res.status(500).render("500", {
    title: "500 - Ошибка сервера",
    error: err.message || "Внутренняя ошибка сервера",
  });
};

module.exports = { errorHandler };