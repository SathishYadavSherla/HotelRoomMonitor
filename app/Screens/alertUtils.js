import { Alert } from 'react-native';

export const showAlertWithNavigationReset = (
  navigation,
  title,
  message,
  targetRouteName, // just the screen you want to reset to
  params = {}
) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: () => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: targetRouteName,
              params
            }
          ]
        });
      }
    }
  ]);
  console.log('Navigation Params:', params);
};

