# HCB2YNAB

Syncing your [Hack Club Bank Account](https://hackclub.com/bank) to [You Need a Budget](https://ynab.com).

> ⚠️ Please note that I made this in like 2-3 hours, and is still a work in progress. Feel free to create issues or PRs

## ⚒️ Setup
1. Copy `config.js.sample` to `config.js` 
2. Create an "unlinked" account on YNAB. The URL should look like this:
https://app.ynab.com/d320cb07-ea1c-459b-986f-8da0919f9790/accounts/d5b8ac26-e058-4a80-8d5c-23d7013da426

Take the first part, `d320cb07-ea1c-459b-986f-8da0919f9790` and put it in `ynabID`. Then, take the second part (`d5b8ac26-e058-4a80-8d5c-23d7013da426`) in `accountID`. This will look diffrent for each user
3. Enable transparrency mode and take your bank URL's slug and place it into `bankID`

![](https://doggo.ninja/SJD8C3.png)

4. Get a Personal Access Token from the [YNAB settings page](https://app.ynab.com/settings/developer), and paste it into the `token` slot.
5. `(npm/yarn) install` the package
6. Run `node .` to pull all transactions into YNAB, and run it again to start the cron job.

## 🕷️ Known Bugs
1. Outward Transfers (as in moving money from one account to another) currently show up as an addition of money, so currently some tranactions may not be copied correctly. [This seems to be a bank issue](https://hackclub.slack.com/archives/CN523HLKW/p1689192572237309).