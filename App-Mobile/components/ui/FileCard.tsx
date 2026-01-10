// components/ui/FileCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';

interface FileCardProps {
  fileName: string;
  fileUrl: string;
  onPress: () => void;
  onDelete?: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  fileName,
  fileUrl,
  onPress,
  onDelete,
}) => {
  // Enlève l'extension
  const displayName = fileName.replace(/\.[^/.]+$/, '');
  
  // Icône selon le type
  const getFileIcon = () => {
    if (fileName.endsWith('.pdf')) return 'document-text';
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/)) return 'image';
    return 'document';
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getFileIcon()} 
          size={24} 
          color={colors.accent[300]} 
        />
      </View>
      
      <Text style={styles.fileName} numberOfLines={2}>
        {displayName}
      </Text>
      
      {onDelete && (
        <Pressable
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  pressed: {
    backgroundColor: colors.primary[50],
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});