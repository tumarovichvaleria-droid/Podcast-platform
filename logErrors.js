const LOG_ERROR_CODES = {
  DIR_IS_FILE: {
    code: 'ERR_LOG_IS_DIRECTORY',
    message: 'Ошибка записи системного журнала'
  },
  NO_PERMISSION: {
    code: 'ERR_LOG_PERMISSION_DENIED',
    message: 'Ошибка записи системного журнала'
  },
  FILE_NOT_FOUND: {
    code: 'ERR_LOG_NOT_FOUND',
    message: 'Ошибка записи системного журнала'
  },
  UNKNOWN: {
    code: 'ERR_LOG_UNKNOWN',
    message: 'Ошибка записи системного журнала'
  }
};

module.exports = LOG_ERROR_CODES;