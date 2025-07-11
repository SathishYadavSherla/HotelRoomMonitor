import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, backgroundColor = '#F4F6F8', barStyle = 'dark-content' }) => {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor={backgroundColor} barStyle={barStyle} />
            {children}
        </SafeAreaView>
    );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
