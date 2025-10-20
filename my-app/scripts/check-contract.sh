#!/bin/bash

# Script to check and fund the Bitcoin Dice contract

CONTRACT_ADDRESS="ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK"
NETWORK="testnet"
API_URL="https://api.testnet.hiro.so"

echo "🎲 Bitcoin Dice Contract Health Check"
echo "======================================"
echo ""

# Check contract balance
echo "📊 Checking contract balance..."
BALANCE_DATA=$(curl -s "${API_URL}/extended/v1/address/${CONTRACT_ADDRESS}/balances")
STX_BALANCE=$(echo $BALANCE_DATA | grep -o '"stx":{"balance":"[0-9]*"' | grep -o '[0-9]*')

if [ -z "$STX_BALANCE" ]; then
    echo "❌ Could not fetch contract balance"
    exit 1
fi

# Convert microSTX to STX
STX_AMOUNT=$(echo "scale=2; $STX_BALANCE / 1000000" | bc)

echo "💰 Contract Balance: ${STX_AMOUNT} STX"
echo ""

# Check if contract needs funding
MIN_BALANCE=100000000  # 100 STX
if [ "$STX_BALANCE" -lt "$MIN_BALANCE" ]; then
    echo "⚠️  WARNING: Contract balance is low!"
    echo "   The contract needs STX to pay out winners."
    echo ""
    echo "   To fund the contract:"
    echo "   1. Open your Hiro Wallet"
    echo "   2. Click 'Send'"
    echo "   3. Recipient: ${CONTRACT_ADDRESS}"
    echo "   4. Amount: 100-500 STX (recommended for testing)"
    echo "   5. Confirm transaction"
    echo ""
else
    echo "✅ Contract has sufficient balance to pay winners"
    echo ""
fi

# Check recent transactions
echo "📜 Recent Contract Activity:"
echo "----------------------------"
RECENT_TX=$(curl -s "${API_URL}/extended/v1/address/${CONTRACT_ADDRESS}/transactions?limit=5")

# Parse and display
echo "$RECENT_TX" | grep -o '"tx_type":"[^"]*"' | head -5 | while read -r line; do
    TX_TYPE=$(echo $line | cut -d'"' -f4)
    echo "   • ${TX_TYPE}"
done

echo ""
echo "🔗 View on Explorer:"
echo "   https://explorer.hiro.so/address/${CONTRACT_ADDRESS}?chain=${NETWORK}"
echo ""

# Check if contract is deployed
echo "📋 Contract Status:"
CONTRACT_INFO=$(curl -s "${API_URL}/v2/contracts/interface/${CONTRACT_ADDRESS}/bitcoin-dice")

if echo "$CONTRACT_INFO" | grep -q "place-bet"; then
    echo "   ✅ Contract is deployed and accessible"
else
    echo "   ❌ Contract may not be deployed or accessible"
fi

echo ""
echo "======================================"
echo "Health check complete!"
