import { Alert } from 'react-native';

export const showAlertWithNavigationReset = (
  navigation,
  title,
  message,
  parentRouteName,
  nestedRouteName
) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: () => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: parentRouteName,
              state: {
                routes: [{ name: nestedRouteName }]
              }
            }
          ]
        });
      }
    }
  ]);
};
