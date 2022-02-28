require("dotenv").config();
(async () => {
  // start preparations
  const preparations = require("../lib/db/preparations.js");
  const insertUser = require("../lib/db/utils/insertUser.js");

  await preparations();
  await insertUser(
    "desmetm",
    "100914609366428418030",
    "lego1302@gmail.com",
    true,
    "527C3A3EFC4143919CABE84D5ACCA153",
    "7450135AF58E4466B7A1FD8740FFCB91",
    "A09A99556A794DB2A007A3090590F344",
    "E2ECA46C8D9848B3A91D325834E46AF6"
  );
  process.exit();
  // end preparations
})();
