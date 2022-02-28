const OAuth = require("oauth");
const { Pool } = require("pg");
let pool = new Pool();
const updateApiCall = require("../db/utils/updateApiCall");

/** 
 * Makes a get request to a specific url with credentials of a user.
 * @param {String} url 
 * @param {String} user_fyrebrick_id 
 * @param {Boolean} DO_NOT_REPEAT 
  **/
async function get(url, user_fyrebrick_id, DO_NOT_REPEAT = false) {
  return new Promise(async (resolve, reject) => {
    const client = await pool.connect();
    let res = await client.query(
      'SELECT * FROM "user" WHERE fyrebrick_id = $1',
      [user_fyrebrick_id]
    );
    client.release();
    let user = res.rows[0];
    if (!user) {
      console.log(
        "Error! no user found with id " + user_fyrebrick_id + ", stopping",
        url
      );
      return;
    }
    const oauth = new OAuth.OAuth(
      user.token_value,
      user.token_secret,
      user.consumer_key,
      user.consumer_secret,
      "1.0",
      null,
      "HMAC-SHA1"
    );
    await updateApiCall.once(user_fyrebrick_id);
    oauth.get(url, oauth._requestUrl, oauth._accessUrl, async (err, data) => {
      let statuscode = -1;
      if (err) {
        statuscode = err.statusCode;
      }
      // console.log(data);
      try {
        statuscode =
          JSON.parse(data)?.meta?.code ??
          JSON.parse(data)?.code ??
          JSON.parse(data)?.data?.statusCode ??
          JSON.parse(data)?.statusCode;
      } catch (e) {
        statuscode = data?.statusCode ?? data?.code ?? err?.statusCode ?? 500;
      }
    //   console.log(statuscode);
      if (statuscode == 503) {
        if (DO_NOT_REPEAT) {
            console.log("Error! 503, stopping");
          resolve([]);
        } else {
          //wait for 1 minute and try again
          console.log("Error! Service Temporarily Unavailable " +statuscode +", waiting for 1 minute and trying again",url);
          delay(60000).then(async () => {
            resolve(await get(url, user_fyrebrick_id, true));
          });
        }
      } else if (
        //check for 404
        statuscode == 404
      ) {
        resolve(0); //means it does not exist any more, therefore 0 quantity
      } else {
        try {
          resolve(JSON.parse(data).data);
        } catch (e) {
          console.log("Error! parsing data", data);
          resolve([])
        }
      }
    });
  });
}

module.exports = {
  get,
};

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }