import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, errorMessage: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text variant="h2" style={styles.title}>Something went wrong</Text>
        <Text variant="body" style={styles.message}>
          The app ran into an unexpected error. Tap below to try again.
        </Text>
        {__DEV__ && (
          <Text variant="caption" style={styles.debug} numberOfLines={4}>
            {this.state.errorMessage}
          </Text>
        )}
        <TouchableOpacity style={styles.button} onPress={this.reset} activeOpacity={0.8}>
          <Text variant="button" style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: { textAlign: 'center', marginBottom: 12, color: '#2C2C2A' },
  message: { textAlign: 'center', color: '#5F5E5A', marginBottom: 24 },
  debug: {
    color: '#D85A30',
    backgroundColor: '#FAECE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  button: {
    backgroundColor: '#378ADD',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: '#FFFFFF' },
});
