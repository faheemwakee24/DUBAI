import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../constants/colors';

export interface ShimmerProps {
  style?: StyleProp<ViewStyle>;
  height?: DimensionValue;
  width?: DimensionValue;
  borderRadius?: number;
}

const Shimmer: React.FC<ShimmerProps> = ({
  style,
  height,
  width,
  borderRadius,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      // @ts-ignore stop exists on Animated.CompositeAnimation
      loop.stop && loop.stop();
    };
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  return (
    <View
      style={[
        {
          backgroundColor: colors.white15,
          overflow: 'hidden',
          borderRadius: borderRadius ?? 8,
          height,
          width,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 120,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export default Shimmer;

