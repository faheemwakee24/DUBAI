import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import LiquidGlassBackground from './LiquidGlassBackground';
import { Svgs } from '../../assets/icons';
import { FontFamily } from '../../constants/fonts';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';

interface SearchableDropdownOption {
  value: string;
  label: string;
  language?: string;
  tag?: string | null;
  locale?: string | null;
  language_code?: string;
}

interface SearchableDropdownProps {
  title: string;
  options: SearchableDropdownOption[];
  selectedValue: string;
  onSelect: (value: string, option?: SearchableDropdownOption) => void;
  placeholder?: string;
  required?: boolean;
  style?: any;
  searchPlaceholder?: string;
}

export default function SearchableDropdown({
  title,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select Option',
  required = false,
  style,
  searchPlaceholder = 'Search...',
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query) ||
        (option.language && option.language.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  // Find selected option to display
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === selectedValue || opt.label === selectedValue);
  }, [options, selectedValue]);

  const handleSelect = (option: SearchableDropdownOption) => {
    onSelect(option.value, option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery('');
    }
  };

  const renderItem = ({ item }: { item: SearchableDropdownOption }) => {
    const isSelected = selectedValue === item.value || selectedValue === item.label;
    return (
      <TouchableOpacity
        style={styles.dropdownItemContainer}
        onPress={() => handleSelect(item)}
      >
        <Text
          style={[
            styles.dropdownItem,
            isSelected && styles.selectedItem,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <LiquidGlassBackground style={styles.liquidContainer}>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={toggleDropdown}
        >
          <Text style={styles.title}>
            {title}
            {required && ' *'}
          </Text>
          <View style={styles.row}>
            <Text style={styles.value} numberOfLines={1}>
              {selectedOption?.label || selectedValue || placeholder}
            </Text>
            <Svgs.ArrowDown
              style={[
                styles.arrowIcon,
                isOpen && styles.arrowIconRotated,
              ]}
            />
          </View>
        </TouchableOpacity>
      </LiquidGlassBackground>
      
      {isOpen && (
        <LiquidGlassBackground style={styles.dropdownContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.subtitle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
          </View>
          <View style={styles.listWrapper}>
            <FlatList
              data={filteredOptions}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              style={styles.listContainer}
              contentContainerStyle={styles.listContent}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
            />
          </View>
        </LiquidGlassBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.width(15),
  },
  liquidContainer: {
    borderRadius: 12,
  },
  dropdownContainer: {
    borderRadius: 12,
    marginTop: metrics.width(5),
  },
  descriptionContainer: {
    padding: metrics.width(12),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(5),
  },
  value: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    flex: 1,
    marginRight: metrics.width(10),
  },
  arrowIcon: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  searchContainer: {
    padding: metrics.width(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.white15,
  },
  searchInput: {
    backgroundColor: colors.white5,
    borderRadius: 8,
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(10),
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  listWrapper: {
    maxHeight: metrics.width(300),
  },
  listContainer: {
  
  },
  listContent: {
    padding: metrics.width(12),
    paddingTop: metrics.width(8),
  },
  dropdownItemContainer: {
    paddingVertical: metrics.width(10),
  },
  dropdownItem: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  selectedItem: {
    color: colors.white,
    fontFamily: FontFamily.spaceGrotesk.bold,
  },
  emptyContainer: {
    padding: metrics.width(20),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
});

