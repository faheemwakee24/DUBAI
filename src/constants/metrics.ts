import { Dimensions, PixelRatio } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const { width, height } = Dimensions.get('screen');

export const metrics = {
  screenHeight: width < height ? height : width,
  screenWidth: width < height ? width : height,

  // functions
  height(value: number | string) {
    const givenWidth =
      typeof value === 'number' ? value : parseFloat(value);
    const multiPly = givenWidth * 0.23;
    return PixelRatio.roundToNearestPixel((width * multiPly) / 100);
  },
  width(value: number | string) {
    const givenHeight =
      typeof value === 'number' ? value : parseFloat(value);
    const multiPly = givenHeight * 0.108;
    return PixelRatio.roundToNearestPixel((height * multiPly) / 100);
  },
};
