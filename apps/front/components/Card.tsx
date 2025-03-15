import { Dimensions, Image, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

type Props = {
	title: string;
	posterUrl?: string | null;
};

const Card = ({ posterUrl }: Props) => {
	const SCREEN_HEIGHT = Dimensions.get("screen").height;
	const SCREEN_WIDTH = Dimensions.get("screen").width;
	const HEIGHT = 500;
	const WIDTH = (HEIGHT / 40) * 27;

	const isFlipped = useSharedValue(false);

	const animation = useDerivedValue(() => {
		return withTiming(isFlipped.value ? 1 : 0, { duration: 500 });
	});

	const isPressed = useSharedValue(false);

	const translationX = useSharedValue(0);
	const translationY = useSharedValue(0);

	const driftX = useSharedValue(0);
	const driftY = useSharedValue(0);

	const tapGesture = Gesture.Tap()
		.onBegin((e) => {
			isPressed.value = true;
			driftX.value = withTiming(e.absoluteX - SCREEN_WIDTH / 2, { duration: 50 });
			driftY.value = withTiming(e.absoluteY - SCREEN_HEIGHT / 2, { duration: 50 });
		})
		.onEnd(() => {
			isPressed.value = false;
			isFlipped.value = !isFlipped.value;
		})
		.onFinalize(() => {
			isPressed.value = false;
			driftX.value = withTiming(0, { duration: 50 });
			driftY.value = withTiming(0, { duration: 50 });
			translationX.value = withSpring(0, { mass: 1, damping: 100 });
			translationY.value = withSpring(0, { mass: 1, damping: 100 });
		});

	const panGesture = Gesture.Pan()
		.onStart(() => {
			driftX.value = withTiming(0, { duration: 100 });
			driftY.value = withTiming(0, { duration: 100 });
		})
		.onUpdate((e) => {
			translationX.value = withSpring(e.translationX, { mass: 1, damping: 100 });
			translationY.value = withSpring(e.translationY, { mass: 1, damping: 100 });
		});

	const faceStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(animation.value, [0.49, 0.51], [1, 0], Extrapolation.CLAMP),
			transform: [
				{ rotateY: `${interpolate(animation.value, [0.1, 0.49], [0, 90], Extrapolation.CLAMP)}deg` },
				{ rotateZ: `${interpolate(animation.value, [0.1, 0.5], [0, 5], Extrapolation.CLAMP)}deg` },
				{ scale: interpolate(animation.value, [0, 0.1], [1, 1.05], Extrapolation.CLAMP) },
			],
		} as const;
	});
	const backgroundStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(animation.value, [0.49, 0.51], [0, 1], Extrapolation.CLAMP),
			transform: [
				{ rotateY: `${interpolate(animation.value, [0.51, 0.9], [90, 0], Extrapolation.CLAMP)}deg` },
				{ rotateZ: `${interpolate(animation.value, [0.5, 0.9], [-5, 0], Extrapolation.CLAMP)}deg` },
				{ scale: interpolate(animation.value, [0.9, 1], [1.05, 1], Extrapolation.CLAMP) },
			],
		} as const;
	});

	const wrapperStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: withTiming(interpolate(Number(isPressed.value), [0, 1], [1, 0.98], Extrapolation.CLAMP), {
						duration: 100,
					}),
				},
				{ translateX: translationX.value },
				{ translateY: translationY.value },
				{ rotateX: `${interpolate(driftY.value, [-100, 100], [-8, -8], Extrapolation.CLAMP)}deg` },
				{ rotateY: `${interpolate(driftX.value, [-100, 100], [-8, 8], Extrapolation.CLAMP)}deg` },
			],
		};
	});

	return (
		<Pressable>
			<GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
				<Animated.View style={[{ height: HEIGHT, width: WIDTH }, wrapperStyle]}>
					<Animated.View
						style={[
							{
								height: HEIGHT,
								width: WIDTH,
								position: "absolute",
								top: 0,
								left: 0,
								overflow: "hidden",
								backgroundColor: "#e2e8f0",
								borderRadius: 12,
							},
							faceStyle,
						]}
					>
						<Image
							source={posterUrl ? { uri: posterUrl } : undefined}
							height={HEIGHT}
							width={WIDTH}
							resizeMethod="resize"
						/>
					</Animated.View>
					<Animated.View
						style={[
							{
								height: HEIGHT,
								width: WIDTH,
								position: "absolute",
								top: 0,
								left: 0,
								backgroundColor: "#8ec5ff",
								overflow: "hidden",
								borderRadius: 12,
							},
							backgroundStyle,
						]}
					/>
				</Animated.View>
			</GestureDetector>
		</Pressable>
	);
};

export default Card;
