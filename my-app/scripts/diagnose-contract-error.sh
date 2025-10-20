#!/bin/bash

# Script to diagnose contract resolution errors

CONTRACT_ADDRESS="ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK"
CONTRACT_NAME="bitcoin-dice"
NETWORK="testnet"
API_URL="https://api.testnet.hiro.so"

echo "🔍 Diagnosing Bitcoin Dice Contract Issues"
echo "==========================================="
echo ""

# Check contract balance
echo "📊 Checking Contract Balance..."
BALANCE=$(curl -s "${API_URL}/extended/v1/address/${CONTRACT_ADDRESS}/stx" | jq -r '.balance')
BALANCE_STX=$(echo "scale=2; $BALANCE / 1000000" | bc)
echo "   Contract Balance: ${BALANCE_STX} STX (${BALANCE} micro-STX)"
echo ""

# Check house balance from contract
echo "📊 Checking House Balance Variable..."
HOUSE_BALANCE=$(curl -s "${API_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-house-stats" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'${CONTRACT_ADDRESS}'","arguments":[]}' | jq -r '.result')
echo "   House Balance Response: ${HOUSE_BALANCE}"
echo ""

# Get recent failed transactions
echo "📜 Recent Contract Transactions..."
curl -s "${API_URL}/extended/v1/address/${CONTRACT_ADDRESS}/transactions?limit=5" | \
  jq -r '.results[] | "\(.tx_status) - \(.tx_type) - \(.tx_id[0:16])... - Block: \(.block_height // "pending")"'
echo ""

# Check for pending games
echo "🎲 Checking for Pending Games..."
echo "   (Note: This requires knowing game IDs)"
echo ""

echo "💡 Common Issues:"
echo "   1. Contract balance too low for payouts"
echo "   2. House balance tracking incorrect"
echo "   3. Player trying to resolve too quickly (same block)"
echo "   4. Game already resolved"
echo ""

echo "🔧 Recommended Actions:"
if (( $(echo "$BALANCE_STX < 100" | bc -l) )); then
  echo "   ⚠️  WARNING: Contract balance is low! Fund contract with more STX"
  echo "   Command: stx send <amount> ${CONTRACT_ADDRESS}"
else
  echo "   ✅ Contract has sufficient balance"
fi
echo ""

echo "📝 To check a specific game, run:"
echo "   curl -X POST ${API_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-game \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"sender\":\"${CONTRACT_ADDRESS}\",\"arguments\":[\"0x0100000000000000XX\"]}'"
echo ""
