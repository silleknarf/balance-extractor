import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

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
    const balancesByAccount = {};
    lines.forEach(line => {
      const account = this.getAccount(line);
      const balanceInPence = this.getBalanceInPence(line);

      if (balanceInPence !== 0) {
        if (!balancesByAccount[account]) {
          balancesByAccount[account] = balanceInPence;
        } else {
          balancesByAccount[account] += balanceInPence;
        }
      }
    });

    // Convert back to pounds
    Object.keys(balancesByAccount).forEach(account => {
      balancesByAccount[account] /= 100;
    })

    return balancesByAccount;
  }

  getAccount(line) {
    let account = 'unknown';
    const accounts = ['amex', 'revolut'];
    accounts.forEach(acc => {
      if (line.toLowerCase().includes(acc)) {
        account = acc;
      }
    });
    return account;
  }

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
