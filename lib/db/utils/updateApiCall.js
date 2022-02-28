const {update,select} = require("./crud");

const once = async (user_fyrebrick_id) => {
    let user = await select("user",[{fyrebrick_id:user_fyrebrick_id}]);
    if(user.length === 0){
        console.log("user not found");
        throw "user not found";
        return -1;
    }
    await update("user",[{
        lastupdated:new Date()},{
        apicallamounttotal:Number(Number(user[0].apicallamounttotal)+1)
    }],user_fyrebrick_id);

}

const byAmount = async (user_fyrebrick_id,amount) => {
    let user = await select("user",[{fyrebrick_id:user_fyrebrick_id}]);

    if(user.length === 0){
        console.log("user not found");
        throw "user not found";
        return -1;
    }
    if(amount<=0){
        console.log("amount must be greater than 0");
        throw "amount must be greater than 0";
        return -2;
    }
    update("user",[{
        lastupdated:new Date()},{
        apicallamounttotal:Number(Number(user[0].apicallamounttotal??0)+amount)
    }],user_fyrebrick_id);

}


module.exports = {
    once,
    byAmount
}