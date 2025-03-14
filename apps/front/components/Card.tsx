import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
    title: string;
    posterUrl?: string | null;
};

const Card = ({ posterUrl, title }: Props) => {
    const HEIGHT = 500;
    const WIDTH = (HEIGHT / 40) * 27;
    const flip = useSharedValue(false);
    const animation = useDerivedValue(() => {
        return withTiming(flip.value ? 1 : 0, { duration: 500 });
    });
    const pressed = useSharedValue(false);
    const faceStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animation.value, [0.49, 0.51], [1, 0], Extrapolation.CLAMP),
            transform: [
                {
                    rotateY: `${interpolate(animation.value, [0.1, 0.49], [0, 90], Extrapolation.CLAMP)}deg`,
                },
                {
                    rotateZ: `${interpolate(animation.value, [0.1, 0.5], [0, 5], Extrapolation.CLAMP)}deg`,
                },
                {
                    scale: interpolate(animation.value, [0, 0.1], [1, 1.05], Extrapolation.CLAMP),
                },
            ],
        } as const;
    });
    const backgroundStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animation.value, [0.49, 0.51], [0, 1], Extrapolation.CLAMP),
            transform: [
                {
                    rotateY: `${interpolate(animation.value, [0.51, 0.9], [90, 0], Extrapolation.CLAMP)}deg`,
                },
                {
                    rotateZ: `${interpolate(animation.value, [0.5, 0.9], [-5, 0], Extrapolation.CLAMP)}deg`,
                },
                {
                    scale: interpolate(animation.value, [0.9, 1], [1.05, 1], Extrapolation.CLAMP),
                },
            ],
        } as const;
    });

    const wrapperStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withTiming(interpolate(Number(pressed.value), [0, 1], [1, 0.95], Extrapolation.CLAMP), { duration: 100 }),
                },
            ],
        };
    });

    return (
        <Pressable
            onPress={() => {
                flip.value = !flip.value;
            }}
            onPressIn={() => {
                pressed.value = true;
            }}
            onPressOut={() => {
                pressed.value = false;
            }}
        >
            <Animated.View style={[{ height: HEIGHT, width: WIDTH }, wrapperStyle]}>
                <Animated.View
                    style={[
                        {
                            height: HEIGHT,
                            width: WIDTH,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            overflow: 'hidden',
                            borderRadius: 5,
                        },
                        faceStyle,
                    ]}
                >
                    <Image source={{ uri: posterUrl }} height={HEIGHT} width={WIDTH} resizeMethod="resize" />
                </Animated.View>
                <Animated.View
                    style={[
                        {
                            height: HEIGHT,
                            width: WIDTH,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            overflow: 'hidden',
                            borderRadius: 5,
                            backgroundColor: 'red',
                        },
                        backgroundStyle,
                    ]}
                ></Animated.View>
            </Animated.View>
        </Pressable>
    );
};

export default Card;
