async function getTime(){
    return new Promise ((res, rej) =>{
        const Today = new Date();
        Today.setHours(Today.getHours()+9);
        res(Today.toISOString());
    });    
}

module.exports = getTime;
