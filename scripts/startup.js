require("dotenv").config();
(async () => {
  // start preparations
  const preparations = require("../lib/db/preparations.js");
  const insertUser = require("../lib/db/utils/insertUser.js");

  await preparations();
})();
