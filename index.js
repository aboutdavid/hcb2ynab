const request = require('sync-request');
const config = require("./config.js")
const fs = require("fs")
const ynab = require("ynab");

const accessToken = config.token;
const ynabAPI = new ynab.API(accessToken);

function getAllTransactions(page = 1){
    var res = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: page
        }
      });
      var json = JSON.parse(res.getBody("utf8"))
      var cache = []
      json.forEach(action=>{
          if (action.type == "invoice") return
          cache.push({
              account_id: config.accountID,
              date: action.date,
              amount: action.amount_cents * 10,
              memo: action.memo
          })
      })
      console.log(cache)
      ynabAPI.transactions.bulkCreateTransactions(config.ynabID, {transactions:cache}).catch(e=>console.error(e))

      var next = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: page+1
        }
      })
      if (JSON.parse(next.getBody("utf8")).length > 0)
      getAllTransactions(page+1)
      else {
        var last = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: 1
        }
      })
      fs.writeFileSync("./lastid", JSON.parse(last.getBody("utf8"))[0].id)
      }

}
function getNew(page = 1){
    console.log("✅ New sync completed!")
   var lastid = fs.readFileSync("./lastid", "utf8")
    var res = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: page
        }
      });
      var json = JSON.parse(res.getBody("utf8"))
      var cache = []
      var done = false
      json.forEach(action=>{
          if (done) return
          if (action.type == "invoice") return
          if (action.id == lastid) { done = true; return } 
          cache.push({
              account_id: config.accountID,
              date: action.date,
              amount: action.amount_cents * 10,
              memo: action.memo
          })
      })
    if (cache.length < 1) return
      ynabAPI.transactions.bulkCreateTransactions(config.ynabID, {transactions:cache}).catch(e=>console.error(e))

      var next = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: page+1
        }
      })
      if (JSON.parse(next.getBody("utf8")).length > 0 && !done)
      getNew(page+1)
      else {
        var last = request('GET', `https://bank.hackclub.com/api/v3/organizations/${config.bankID}/transactions?per_page=100`, {
        headers: {
          'user-agent': 'HCB2YNAB/1.0',
        },
        qs: {
          page: 1
        }
      })
      fs.writeFileSync("./lastid", JSON.parse(last.getBody("utf8"))[0].id)
      }
}
(async function() {
    if (!fs.existsSync("./lastid")) {
        console.log("🪙 1st time user, pulling all transactions...")
        getAllTransactions()
        console.log("✅ Exiting. Restart the program to start the cronjob")
    } else {
        console.log("🔃 Starting cronjob to sync YNAB and HCB!")
      getNew()
      setInterval(getNew, 1000 * 60 * 10)
    }
  })();