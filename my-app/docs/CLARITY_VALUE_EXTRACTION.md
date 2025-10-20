# Fixing "Objects are not valid as a React child" Error

## Problem
When displaying contract data in React components, you may encounter this error:
```
Objects are not valid as a React child (found: object with keys {type, value})
```

This happens because Clarity contract responses return structured objects, not primitive values.

## Root Cause

### Clarity Response Structure
When you call `cvToJSON()` on Clarity values, they return objects like:
```javascript
{
  type: "uint",
  value: "123"
}

// Or for tuples:
{
  type: "tuple",
  value: {
    "total-games": { type: "uint", value: "5" },
    "total-wagered": { type: "uint", value: "10000000" },
    "total-won": { type: "uint", value: "5000000" },
    "vip-tier": { type: "uint", value: "1" }
  }
}
```

### Why It Breaks React
When you try to render these objects directly:
```tsx
// ❌ ERROR - trying to render an object
<p>{gameStats['total-games']}</p>  
// Renders: { type: "uint", value: "5" }
```

React can't render objects, only strings, numbers, and React elements.

## Solution: Extract Values

### 1. Create Helper Function
Add this helper to extract the actual value from Clarity objects:

```typescript
// Helper to extract value from Clarity response objects
function extractValue(clarityValue: any): any {
  if (!clarityValue) return 0;
  if (typeof clarityValue === 'object' && 'value' in clarityValue) {
    return clarityValue.value;
  }
  return clarityValue;
}
```

### 2. Use Helper in Components

#### Before (Causes Error):
```tsx
<StatsCard
  title="Total Games"
  value={gameStats?.['total-games'] || 0}  // ❌ Object { type, value }
  icon="🎲"
/>
```

#### After (Works):
```tsx
<StatsCard
  title="Total Games"
  value={extractValue(gameStats?.['total-games']) || 0}  // ✅ Number: 5
  icon="🎲"
/>
```

### 3. Fix Calculations

#### Before:
```typescript
function calculateWinRate(stats: any) {
  const totalGames = stats['total-games'];  // ❌ Object
  const totalWon = stats['total-won'];      // ❌ Object
  
  if (totalGames === 0) return 0;  // ❌ Never true (object !== 0)
  return (totalWon / totalGames * 100).toFixed(1);  // ❌ NaN
}
```

#### After:
```typescript
function calculateWinRate(stats: any) {
  const totalGames = extractValue(stats['total-games']);  // ✅ Number
  const totalWon = extractValue(stats['total-won']);      // ✅ Number
  
  if (totalGames === 0) return 0;  // ✅ Works correctly
  return (totalWon / totalGames * 100).toFixed(1);  // ✅ Correct calculation
}
```

## Complete Example

### PlayerDashboard.tsx (Fixed)
```typescript
import contractService from '@/lib/contract-service';

// Helper to extract value from Clarity response objects
function extractValue(clarityValue: any): any {
  if (!clarityValue) return 0;
  if (typeof clarityValue === 'object' && 'value' in clarityValue) {
    return clarityValue.value;
  }
  return clarityValue;
}

function calculateWinRate(stats: any) {
  if (!stats) return 0;
  const totalGames = extractValue(stats['total-games']);
  const totalWon = extractValue(stats['total-won']);
  const totalWagered = extractValue(stats['total-wagered']);
  
  if (totalGames === 0 || totalWagered === 0) return 0;
  return ((totalWon / totalWagered) * 100).toFixed(1);
}

function getVIPTierName(tierValue: any = 0) {
  const tierNumber = extractValue(tierValue);
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  return tiers[tierNumber] || 'Bronze';
}

// In component render:
<StatsCard
  title="Total Games"
  value={extractValue(gameStats?.['total-games']) || 0}
  icon="🎲"
/>
<StatsCard
  title="Total Wagered"
  value={`${contractService.microToStx(extractValue(gameStats?.['total-wagered']) || 0).toFixed(2)} STX`}
  icon="💰"
/>
<StatsCard
  title="VIP Tier"
  value={getVIPTierName(gameStats?.['vip-tier'])}
  icon="⭐"
/>
```

## Where to Apply This Fix

### Components That Need extractValue():
- ✅ **PlayerDashboard.tsx** - All stats display
- ✅ **Any component** displaying contract data
- ✅ **Calculations** using contract values

### When It's Not Needed:
- ❌ Direct string/number values from API
- ❌ Local state that's already primitive types
- ❌ Props passed as primitives

## Debugging Tips

### 1. Console Log Contract Data
```typescript
const stats = await contractService.getPlayerStats(address);
console.log('Raw stats:', stats);
console.log('Total games:', stats['total-games']);
// See if it's { type, value } or just a number
```

### 2. Check Data Structure
```typescript
// If you see this structure, you need extractValue()
{
  "total-games": { type: "uint", value: "5" },
  "vip-tier": { type: "uint", value: "1" }
}

// If you see this, you don't need extractValue()
{
  "total-games": 5,
  "vip-tier": 1
}
```

### 3. Common Error Messages
```
❌ "Objects are not valid as a React child (found: object with keys {type, value})"
   → You're trying to render a Clarity value object directly
   → Solution: Use extractValue()

❌ "NaN" in calculations
   → You're doing math with Clarity value objects
   → Solution: Extract values before calculations

❌ Comparisons always false (e.g., value === 0 never true)
   → Comparing object to number
   → Solution: Extract value first
```

## Alternative: Parse in Service Layer

Instead of extracting values in components, you can parse them in the contract service:

```typescript
// lib/contract-service.ts
export const getPlayerStats = async (playerAddress: string): Promise<any | null> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-player-stats',
      functionArgs: [standardPrincipalCV(playerAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    if (jsonResult.value === null) {
      return null;
    }

    // Parse Clarity values to primitives
    const stats = jsonResult.value;
    return {
      'total-games': parseInt(stats['total-games']?.value || '0'),
      'total-wagered': parseInt(stats['total-wagered']?.value || '0'),
      'total-won': parseInt(stats['total-won']?.value || '0'),
      'vip-tier': parseInt(stats['vip-tier']?.value || '0'),
      'win-streak': parseInt(stats['win-streak']?.value || '0'),
    };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
};
```

This approach:
- ✅ Centralizes parsing logic
- ✅ Components receive clean data
- ✅ No need for extractValue() in components
- ❌ Requires updating service for each new field

## Summary

**The Problem:**
Clarity contracts return `{ type, value }` objects, not primitive values.

**The Solution:**
Extract the `.value` property before using in React components.

**The Fix:**
```typescript
// Add robust helper that handles nested objects and string numbers
function extractValue(clarityValue: any): any {
  if (!clarityValue) return 0;
  // Handle Clarity value objects {type, value}
  if (typeof clarityValue === 'object' && 'value' in clarityValue) {
    const innerValue = clarityValue.value;
    // Recursively extract if nested
    if (typeof innerValue === 'object' && innerValue !== null && 'value' in innerValue) {
      return extractValue(innerValue);
    }
    // Convert string numbers to actual numbers
    if (typeof innerValue === 'string' && !isNaN(Number(innerValue))) {
      return Number(innerValue);
    }
    return innerValue;
  }
  // Convert string numbers to actual numbers
  if (typeof clarityValue === 'string' && !isNaN(Number(clarityValue))) {
    return Number(clarityValue);
  }
  return clarityValue;
}

// Use everywhere you display contract data
extractValue(gameStats?.['total-games'])
```

**Additional Fix:**
Don't pass raw Clarity stat objects around - only extract what's needed:
```typescript
// ❌ BAD - Passing raw Clarity object
return {
  stats: stats,  // Contains {type, value} objects
};

// ✅ GOOD - Only pass what's needed
return {
  performanceData: [],
  achievements: [],
  // Don't include raw stats object
};
```

**Result:**
✅ No more "Objects are not valid as a React child" errors
✅ Correct calculations and comparisons
✅ Clean display of contract data
✅ Handles nested Clarity values
✅ Converts string numbers to actual numbers
