// components/ui/Card.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  onPress, 
  variant = 'elevated' 
}) => {
  const Component = onPress ? Pressable : View;
  
  return (
    <Component
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        pressed && onPress && styles.pressed,
      ]}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});