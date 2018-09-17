const fs = require('fs');
const path = require('path');
const moment = require('moment'); 
const args = process.argv.slice(2);

if(args.length < 2) {
    console.log(`
    ***********************************************
        Make sure to pass in two arguments
        A startDate and and endDate
        ex: node index.js 2018-04-19 2018-06-23
    ***********************************************
    `);
    process.exit(1);
}

function loadFile(filePath) {
    return new Promise((res,rej) => {
        const file = fs.readFileSync(path.resolve(`data/${filePath}`),'utf8');

        res(JSON.parse(file));
    });
}

function main() {
    let files = fs.readdirSync(path.resolve('data'));

    files = files.map(loadFile)

    Promise.all(files)
        .then(JSONData => {
            //reduce data into a since value
            const total = JSONData
                .map(student => student.days)
                .map(days => {
                    return days.filter((day) => {
                        return moment(day.date).isBetween(args[0],args[1],null,'[]');
                    });
                })
                .map(days => {
                    return days.reduce((acc,curr) => {
                        return acc + curr.grand_total.total_seconds
                    },0);
                })
                .reduce((acc,curr) => {
                    return acc + curr
                },0);
            
            const duration = moment.duration({seconds:total});
            const hours = duration.asHours();
            const average = hours/JSONData.length;
            console.log(`Based on ${JSONData.length} students`)
            console.log(`Total Time:\nHours - ${hours}\nAverage - ${average}`);
        });
}

main();