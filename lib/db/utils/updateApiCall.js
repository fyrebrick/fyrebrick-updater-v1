const {update,select} = require("./crud");
const progress = require("../../utils/progress");
const cliProgress = require('cli-progress');

const once = async (user_fyrebrick_id) => {
    let user = await select("user",[{fyrebrick_id:user_fyrebrick_id}]);
    if(user.length === 0){
        throw "user not found";
        return -1;
    }
    await update("user",[{
        lastupdated:new Date()},{
        apicallamounttotal:Number(Number(user[0]?.apicallamounttotal??0)+1),
        apicallamountdaily:Number(Number(user[0]?.apicallamountdaily??0)+1)
    }],user_fyrebrick_id);

}

const byAmount = async (user_fyrebrick_id,amount) => {
    let user = await select("user",[{fyrebrick_id:user_fyrebrick_id}]);

    if(user.length === 0){
        throw "user not found";
        return -1;
    }
    if(amount<=0){
        throw "amount must be greater than 0";
        return -2;
    }
    update("user",[{
        lastupdated:new Date()},{
        apicallamounttotal:Number(Number(user[0]?.apicallamounttotal??0)+1),
        apicallamountdaily:Number(Number(user[0]?.apicallamountdaily??0)+1)
    }],user_fyrebrick_id);

}

const cleanupDaily = async () => {
    let users = await select("user");
    const progressBar = new cliProgress.SingleBar(progress, cliProgress.Presets.shades_grey)
    progressBar.start(users.length, 0,{description:"Api calls daily clean up"});
    for await(let user of users){
        if(user?.consumer_key){
            await update("user",[
                {lastupdated:new Date()},
                {apicallamountdaily:0}
            ],user.fyrebrick_id);
        }
        progressBar.increment();
    }
    progressBar.stop();
}


module.exports = {
    once,
    byAmount,
    cleanupDaily
}