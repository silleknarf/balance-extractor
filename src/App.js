import React from 'react';
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
    const balanceRegex = /\d+\.\d+/;
    const balancesByAccount = {};
    lines.forEach(line => {
      const balances = line.match(balanceRegex);
      const account = this.getAccount(line);
      if (balances) {
        balances.forEach(balance => {
          const balanceAmount = parseFloat(balance);
          if (!balancesByAccount[account]) {
            balancesByAccount[account] = balanceAmount;
          } else {
            balancesByAccount[account] += balanceAmount;
          }
        });
      }
    });
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

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
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
      </div>
    );
  }
}
