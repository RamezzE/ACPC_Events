import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { admin_login } from '../../api/admin_functions';

const validateSignIn = (name, password) => {
  var result = {
    success: false,
    errorMsg: ''
  };

  if (!name || !password) {
    result.errorMsg = 'Please fill in all the fields';
    return result;
  }

  result.success = true;
  return result;
};

const SignIn = () => {
  const [form, setForm] = useState({
    name: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    var result = validateSignIn(form.name, form.password);

    if (!result.success) {
      Alert.alert('Error', result.errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await admin_login(form.name, form.password);

      if (!response.success) {
        Alert.alert('Error', response.errorMsg);
        return;
      }

      router.push('/teams');

      // const user = await getCurrentUser(loginResult.token);

      // Assuming you have setUser and setIsLoggedIn functions from context
      // setUser(user);
      // setIsLoggedIn(true);

    } catch (error) {
      Alert.alert('Error', "Error logging in");
      console.log(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className='w-full justify-center min-h-[75vh] px-4 my-6'>
          {/* <Image 
            source={images.logo}
            resizeMode='contain'
            className='w-[115px] h-[35px]'
          /> */}

          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold'>
            Log in to Domination
          </Text>

          <FormField 
            title='Admin Name'
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
            otherStyles='mt-7'
          />

          <FormField 
            title='Password'
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles='mt-7'
          />

          <CustomButton 
            title='Sign In'
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;