import React from 'react';
import { SvgProps } from 'react-native-svg';
import { Svgs, SvgIconName } from '../../assets/icons';

type IconProps = SvgProps & {
    name: SvgIconName;
    size?: number;
    color?: string;
};

export default function Icon({ name, size = 24, color = '#000', ...props }: IconProps) {
    const iconProps = {
        width: size,
        height: size,
        color,
        ...props,
    };

    const IconComponent = Svgs[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in Svgs object`);
        return null;
    }

    return <IconComponent {...iconProps} />;
}
