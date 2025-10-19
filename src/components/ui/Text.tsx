import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Typography, FontFamily, FontSize, FontWeight } from '../../constants/fonts';

type TextVariant = keyof typeof Typography;
type FontWeightType = keyof typeof FontWeight;

type TextProps = RNTextProps & {
    variant?: TextVariant;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: FontWeightType;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    numberOfLines?: number;
    style?: TextStyle;
};

export default function Text({
    children,
    variant = 'body',
    fontFamily,
    fontSize,
    fontWeight,
    color,
    textAlign,
    numberOfLines,
    style,
    ...props
}: TextProps) {
    const getTextStyle = (): TextStyle => {
        const baseStyle = Typography[variant];

        return {
            ...baseStyle,
            ...(fontFamily && { fontFamily }),
            ...(fontSize && { fontSize }),
            ...(fontWeight && { fontWeight: FontWeight[fontWeight] }),
            ...(color && { color }),
            ...(textAlign && { textAlign }),
            ...style,
        };
    };

    return (
        <RNText
            style={getTextStyle()}
            numberOfLines={numberOfLines}
            {...props}
        >
            {children}
        </RNText>
    );
}

// Export typography presets for direct use
export { Typography, FontFamily, FontSize, FontWeight };
