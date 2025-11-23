import { Platform } from 'react-native';

// Font family constants with proper iOS font names
// On iOS with separate font files, use the exact PostScript name from the font file
// Common PostScript names for Space Grotesk: "SpaceGrotesk-Light", "SpaceGrotesk-Regular", etc.
// If this doesn't work, try using "SpaceGrotesk" (base name) with fontWeight instead
export const FontFamily = {
    // SpaceGrotesk font family
    // iOS: Try PostScript names first (most common with separate font files)
    // Android: Use specific font file names
    spaceGrotesk: {
        light: Platform.OS === 'ios' ? 'SpaceGrotesk-Light' : 'SpaceGrotesk-Light',
        regular: Platform.OS === 'ios' ? 'SpaceGrotesk-Regular' : 'SpaceGrotesk-Regular',
        medium: Platform.OS === 'ios' ? 'SpaceGrotesk-Medium' : 'SpaceGrotesk-Medium',
        semiBold: Platform.OS === 'ios' ? 'SpaceGrotesk-SemiBold' : 'SpaceGrotesk-SemiBold',
        bold: Platform.OS === 'ios' ? 'SpaceGrotesk-Bold' : 'SpaceGrotesk-Bold',
    },

    // Fallback fonts
    system: {
        light: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
        regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        semiBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-black',
    },
} as const;

// Font loading utility
export function getFontFamily(
    family: keyof typeof FontFamily,
    weight: keyof (typeof FontFamily)[keyof typeof FontFamily]
) {
    const fontFamily = FontFamily[family][weight];

    // Debug logging for iOS
    if (__DEV__ && Platform.OS === 'ios') {
        console.log(`Loading font: ${fontFamily}`);
    }
    
    return fontFamily;
}

// Helper to get complete font style with fontFamily and fontWeight
// Use this when you need both fontFamily and fontWeight (especially on iOS)
export function getFontStyleWithWeight(
    family: keyof typeof FontFamily,
    weight: keyof (typeof FontFamily)[keyof typeof FontFamily]
) {
    const fontFamily = FontFamily[family][weight];
    const weightMap: Record<string, string> = {
        light: FontWeight.light,
        regular: FontWeight.regular,
        medium: FontWeight.medium,
        semiBold: FontWeight.semiBold,
        bold: FontWeight.bold,
    };
    
    return {
        fontFamily,
        fontWeight: weightMap[weight] || FontWeight.regular,
    };
}

// Helper to get font style with proper weight handling
// On iOS: Uses "SpaceGrotesk" with fontWeight
// On Android: Uses specific font file names
export function getFontStyle(
    family: keyof typeof FontFamily,
    weight: keyof (typeof FontFamily)[keyof typeof FontFamily],
    fontSize?: number,
    lineHeight?: number
) {
    const fontFamily = FontFamily[family][weight];
    const style: any = {
        fontFamily,
    };
    
    if (fontSize) {
        style.fontSize = fontSize;
    }
    
    if (lineHeight) {
        style.lineHeight = lineHeight;
    }
    
    // Add fontWeight for both platforms
    // iOS uses "SpaceGrotesk" with fontWeight to select the correct font file
    // Android also needs fontWeight for proper rendering
    const weightMap: Record<string, string> = {
        light: FontWeight.light,
        regular: FontWeight.regular,
        medium: FontWeight.medium,
        semiBold: FontWeight.semiBold,
        bold: FontWeight.bold,
    };
    style.fontWeight = weightMap[weight] || FontWeight.regular;
    
    return style;
}

// Font weight constants
export const FontWeight = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
} as const;

// Font size constants
export const FontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
} as const;

// Line height constants
export const LineHeight = {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
} as const;

// Typography presets
export const Typography = {
    // Headings
    // On iOS: Using PostScript names (e.g., "SpaceGrotesk-Bold") - don't include fontWeight
    // On Android: Use specific font file names with fontWeight
    h1: {
        fontFamily: FontFamily.spaceGrotesk.bold,
        fontSize: FontSize['4xl'],
        lineHeight: FontSize['4xl'] * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.bold }),
    },
    h2: {
        fontFamily: FontFamily.spaceGrotesk.bold,
        fontSize: FontSize['3xl'],
        lineHeight: FontSize['3xl'] * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.bold }),
    },
    h3: {
        fontFamily: FontFamily.spaceGrotesk.semiBold,
        fontSize: FontSize['2xl'],
        lineHeight: FontSize['2xl'] * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.semiBold }),
    },
    h4: {
        fontFamily: FontFamily.spaceGrotesk.semiBold,
        fontSize: FontSize.xl,
        lineHeight: FontSize.xl * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.semiBold }),
    },
    h5: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },
    h6: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },

    // Body text
    body: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.regular }),
    },
    bodyLarge: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.regular }),
    },
    bodySmall: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.regular }),
    },

    // Captions and labels
    caption: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.xs,
        lineHeight: FontSize.xs * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.regular }),
    },
    label: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.normal,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },

    // Buttons
    button: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },
    buttonLarge: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },
    buttonSmall: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.tight,
        ...(Platform.OS === 'android' && { fontWeight: FontWeight.medium }),
    },
} as const;

// (removed duplicate getFontFamily)

// Helper function to create custom typography
// On iOS: Uses "SpaceGrotesk" with fontWeight
// On Android: Can use specific font file names or base name with fontWeight
export const createTypography = (
    fontFamily: string,
    fontSize: number,
    fontWeight: string = FontWeight.regular,
    lineHeight?: number
) => {
    return {
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight: lineHeight || fontSize * LineHeight.normal,
    };
};
