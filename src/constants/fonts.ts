// Font family constants
export const FontFamily = {
    // SpaceGrotesk font family
    spaceGrotesk: {
        light: 'SpaceGrotesk-Light',
        regular: 'SpaceGrotesk-Regular',
        medium: 'SpaceGrotesk-Medium',
        semiBold: 'SpaceGrotesk-SemiBold',
        bold: 'SpaceGrotesk-Bold',
    },

    // Fallback fonts
    system: {
        light: 'System',
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
        bold: 'System',
    },
} as const;

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
    h1: {
        fontFamily: FontFamily.spaceGrotesk.bold,
        fontSize: FontSize['4xl'],
        lineHeight: FontSize['4xl'] * LineHeight.tight,
        fontWeight: FontWeight.bold,
    },
    h2: {
        fontFamily: FontFamily.spaceGrotesk.bold,
        fontSize: FontSize['3xl'],
        lineHeight: FontSize['3xl'] * LineHeight.tight,
        fontWeight: FontWeight.bold,
    },
    h3: {
        fontFamily: FontFamily.spaceGrotesk.semiBold,
        fontSize: FontSize['2xl'],
        lineHeight: FontSize['2xl'] * LineHeight.tight,
        fontWeight: FontWeight.semiBold,
    },
    h4: {
        fontFamily: FontFamily.spaceGrotesk.semiBold,
        fontSize: FontSize.xl,
        lineHeight: FontSize.xl * LineHeight.normal,
        fontWeight: FontWeight.semiBold,
    },
    h5: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.normal,
        fontWeight: FontWeight.medium,
    },
    h6: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.normal,
        fontWeight: FontWeight.medium,
    },

    // Body text
    body: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.normal,
        fontWeight: FontWeight.regular,
    },
    bodyLarge: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.normal,
        fontWeight: FontWeight.regular,
    },
    bodySmall: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.normal,
        fontWeight: FontWeight.regular,
    },

    // Captions and labels
    caption: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: FontSize.xs,
        lineHeight: FontSize.xs * LineHeight.normal,
        fontWeight: FontWeight.regular,
    },
    label: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.normal,
        fontWeight: FontWeight.medium,
    },

    // Buttons
    button: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.base,
        lineHeight: FontSize.base * LineHeight.tight,
        fontWeight: FontWeight.medium,
    },
    buttonLarge: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.tight,
        fontWeight: FontWeight.medium,
    },
    buttonSmall: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * LineHeight.tight,
        fontWeight: FontWeight.medium,
    },
} as const;

// Helper function to get font family with fallback
export const getFontFamily = (fontName: string): string => {
    return fontName;
};

// Helper function to create custom typography
export const createTypography = (
    fontFamily: string,
    fontSize: number,
    fontWeight: string = FontWeight.regular,
    lineHeight?: number
) => ({
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight: lineHeight || fontSize * LineHeight.normal,
});
