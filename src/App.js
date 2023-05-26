import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';


const accounts = [
  { accountName: 'amex' },
  { accountName: 'revolut' },
  { accountName: 'ca1' },
  { accountName: 'treat fund', aliases: ['le treat'] }
];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balanceByAccount: {}
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const balanceByAccount = this.getBalanceByAccount(event.target.value);
    console.log(balanceByAccount);
    this.balanceByAccount = this.setState({
      balanceByAccount: balanceByAccount
    });
  }

  getBalanceByAccount(text) {
    const lines = text.split('\n');
    const accountBalances = lines
      .map(line => ({
          accountName: this.getAccountName(line),
          balanceInPence: this.getBalanceInPence(line)
      }));

    this.enrichAccountUsingNextAccount(accountBalances);

    const balanceInPenceByAccount = this.getBalanceInPenceByAccount(accountBalances);

    const balanceByAccount = {};
    Object.keys(balanceInPenceByAccount).forEach(accountName => {
      balanceByAccount[accountName] = balanceInPenceByAccount[accountName] / 100;
    });

    return balanceByAccount;
  }

  getBalanceInPenceByAccount(accountBalances) {
    const balanceInPenceByAccount = {};
    accountBalances.forEach(accountBalance => {
      if (accountBalance.balanceInPence !== 0) {
        if (!balanceInPenceByAccount[accountBalance.accountName]) {
          balanceInPenceByAccount[accountBalance.accountName] = accountBalance.balanceInPence;
        } else {
          balanceInPenceByAccount[accountBalance.accountName] += accountBalance.balanceInPence;
        }
      }
    });
    return balanceInPenceByAccount;
  }

  getAccountName(line) {
    let account = null;
    accounts
      .flatMap(acc => [acc.accountName] + (acc.aliases || []))
      .filter(alias => line.toLowerCase().includes(alias))
      .forEach(acc => account = acc.accountName);
    return account;
  }

  /**
   * Parse a line containing a sterling monetary amount and return the number of pence 
   * as an int. 
   * E.g. "£102.2 to revolut" => 10220
   */
  getBalanceInPence(line) {
    const balanceRegex = /£(\d+)\.?(\d+)?/;
    const balanceMatch = line.match(balanceRegex);
    let balanceAmount = 0;

    if (!balanceMatch) return balanceAmount;

    // Handle pounds
    if (balanceMatch[1]) {
      balanceAmount += parseInt(balanceMatch[1] * 100);
    }
    // Handle pence
    if (balanceMatch[2]) {
      if (balanceMatch[2].length === 1) {
        balanceAmount += parseInt(balanceMatch[2] * 10);
      } else if (balanceMatch[2].length === 2) {
        balanceAmount += parseInt(balanceMatch[2]);
      }
    }

    return balanceAmount;
  }

  /**
   * If we don't have an account we populate it using the next
   * available one or "unknown"
   */
  enrichAccountUsingNextAccount(accountBalances) {
    for (let i = 0; i < accountBalances.length; i++) {
      const accountBalance = accountBalances[i];
      if (!accountBalance.accountName) {
        const remainingAccounts = accountBalances.slice(i + 1)
        const nextAccount = remainingAccounts
          .filter(accountBalance => accountBalance.accountName)
          .map(accountBalance => accountBalance.accountName)[0];
        accountBalance.account = nextAccount || "unknown";
      }
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      const copiedToClipboardText = "Copied to clipboard";
      console.log(copiedToClipboardText);
      toast(copiedToClipboardText, { autoClose: 2000 })
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  render() {
    const balanceByAccount = Object.keys(this.state.balanceByAccount).map(
      account => {
        const balance = this.state.balanceByAccount[account];
        return (
          <div key={account}>
            <span>
              <b>Account:</b> {account}{' '}
            </span>
            <span>
              <b>Balance:</b> {balance}
            </span>
            <button onClick={() => this.copyToClipboard(balance)}>
              📋 Copy to clipboard
            </button>
          </div>
        );
      }
    );
    return (
      <div>
        <div style={{ fontWeight: 'bold', fontSize: 'xx-large' }}>
          ⚖️ Balance Extractor
        </div>
        <div>
          Copy and paste messages from WhatsApp into the box below. Account
          balances will be extracted and totalled up.
        </div>
        <textarea
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        {balanceByAccount}
        <ToastContainer />
      </div>
    );
  }
}
