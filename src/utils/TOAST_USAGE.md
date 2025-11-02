# Toast Message Usage Guide

This project uses `react-native-toast-message` for displaying non-blocking notifications to users.

## Setup

The toast is already configured in `App.tsx` with custom styling that matches your app design.

## Usage

### Import the utility

```typescript
import { showToast } from '../utils/toast';
// or
import { showToast } from '../utils';
```

### Show Success Toast

```typescript
showToast.success('Login successful!');
showToast.success('Account created', 'Welcome to the app');
```

### Show Error Toast

```typescript
showToast.error('Login failed');
showToast.error('Network error', 'Please check your internet connection');
```

### Show Info Toast

```typescript
showToast.info('Processing...');
showToast.info('Update available', 'Please update to the latest version');
```

## Example: Replace Alert with Toast

### Before (using Alert)
```typescript
Alert.alert('Success', 'Login successful');
```

### After (using Toast)
```typescript
showToast.success('Login successful');
```

## When to Use Toast vs Alert

- **Toast**: Use for non-critical notifications, success messages, info messages
  - Login success
  - Data saved
  - Network status updates
  - Form validation errors
  
- **Alert**: Use for critical actions requiring user confirmation
  - Delete confirmation
  - Logout confirmation
  - Critical errors requiring action
  - Important warnings

## Customization

The toast styles are defined in `src/components/ui/ToastConfig.tsx` and can be customized to match your app's design theme.

## Advanced Usage

You can also use Toast directly:

```typescript
import Toast from 'react-native-toast-message';

Toast.show({
  type: 'success',
  text1: 'Hello',
  text2: 'This is a subtitle',
  position: 'top',
  visibilityTime: 3000,
});
```

