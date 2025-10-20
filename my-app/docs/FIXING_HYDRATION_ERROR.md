# Fixing React Hydration Error

## Problem
The jackpot display was causing a hydration mismatch error because:
- Server rendered one value (e.g., 1236.94 STX)
- Client rendered different value (e.g., 1245.90 STX)
- This happened because `Date.now()` produces different values on server vs client

## Solution

### 1. Static Initial Render
```typescript
const getInitialAmount = () => {
  if (amount > 1) return amount;
  // Same value on server AND client
  const baseAmounts = [1250.75, 890.50, 645.25];
  return baseAmounts[gameMode] || 1000;
};
```

### 2. Client-Only Dynamic Updates
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true); // Flag that we're on client
}, []);

useEffect(() => {
  if (!mounted) return; // Skip updates until mounted
  // Now safe to use Date.now() and dynamic values
}, [mounted]);
```

### 3. Server-Safe Simulation Function
```typescript
const getSimulatedJackpot = (mode: number) => {
  // Return static value on server
  if (typeof window === 'undefined') {
    const baseAmounts = [1250.75, 890.50, 645.25];
    return baseAmounts[mode] || 1000;
  }
  
  // Dynamic values only on client
  const variance = Math.sin(Date.now() / 10000) * 50;
  return base + variance;
};
```

## What Changed

### Before (Caused Hydration Error):
```typescript
// ❌ Different value on server vs client
const [displayAmount, setDisplayAmount] = useState(
  amount > 1 ? amount : getSimulatedJackpot(gameMode)
);
// getSimulatedJackpot() uses Date.now() immediately
```

### After (No Hydration Error):
```typescript
// ✅ Same value on server and client
const [displayAmount, setDisplayAmount] = useState(getInitialAmount());
// getInitialAmount() returns static base amount

// ✅ Dynamic updates only after mount
useEffect(() => {
  if (!mounted) return;
  // Now it's safe to use Date.now()
}, [mounted]);
```

## Key Principles for Avoiding Hydration Errors

### 1. Initial State Must Match
Server and client must render identical HTML on first render:
```typescript
// ❌ BAD - Different on server/client
useState(Date.now())
useState(Math.random())
useState(window.innerWidth)

// ✅ GOOD - Same on server/client
useState(0)
useState(1000)
useState(null)
```

### 2. Use Effects for Client-Only Code
Put dynamic code in `useEffect` (only runs on client):
```typescript
const [value, setValue] = useState(staticValue);

useEffect(() => {
  // This only runs on client, after hydration
  setValue(Date.now());
  setValue(Math.random());
  setValue(window.innerWidth);
}, []);
```

### 3. Check for Window
Guard client-only code:
```typescript
if (typeof window !== 'undefined') {
  // Client-only code
}

// Or
if (typeof window === 'undefined') {
  // Server-only code
  return staticValue;
}
```

### 4. Use Mounted Flag
Best practice for complex components:
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <div>Loading...</div>; // SSR fallback
}

return <div>{dynamicContent}</div>; // Client render
```

## Common Causes of Hydration Errors

### ❌ Date/Time Functions
```typescript
// These produce different values each call
Date.now()
new Date().toString()
new Date().toLocaleString()
```

### ❌ Random Numbers
```typescript
Math.random()
Math.floor(Math.random() * 100)
```

### ❌ Browser APIs
```typescript
window.innerWidth
document.getElementById()
localStorage.getItem()
navigator.userAgent
```

### ❌ External Data Without Snapshot
```typescript
// If data changes between server and client render
fetchDataFromAPI()
getFromDatabase()
```

## Testing Your Fix

### Before Fix:
```
Console Error:
❌ Hydration failed because the server rendered text 
   didn't match the client
   
Server HTML: <span>1236.94</span>
Client HTML: <span>1245.90</span>
```

### After Fix:
```
Console:
✅ No errors

Server HTML: <span>1250.75</span>
Client HTML: <span>1250.75</span>

Then after mount:
Client HTML: <span>1245.90</span> (animated change, OK)
```

## Summary

✅ **Fixed hydration error** by ensuring initial render matches on server and client
✅ **Preserved dynamic jackpot** animation (starts after client mount)
✅ **No impact on functionality** - still shows rotating values
✅ **Better performance** - no React tree regeneration

The jackpot display now:
1. Renders same static value on server and client (no error)
2. Starts animating after component mounts (client-only)
3. Updates every 3 seconds with variance (smooth experience)
