import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { login } from '../../api/team_functions';

import { useContext } from 'react';

import { GlobalContext } from '../../context/GlobalProvider';

const validateSignIn = (teamNo, password) => {
  var result = {
    success: false,
    errorMsg: ''
  };

  if (!teamNo || !password) {
    result.errorMsg = 'Please fill in all the fields';
    return result;
  }

  if (isNaN(teamNo)) {
    result.errorMsg = 'Team number must be a number';
    return result;
  }

  result.success = true;
  return result;
};

const SignIn = () => {
  const [form, setForm] = useState({
    teamNo: '',
    password: ''
  });

  const { setName, setTeamNo } = useContext(GlobalContext);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    var result = validateSignIn(form.teamNo, form.password);

    if (!result.success) {
      Alert.alert('Error', result.errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResult = await login(form.teamNo, form.password);

      if (!loginResult.success) {
        Alert.alert('Error', loginResult.errorMsg);
        return;
      }

      setName(loginResult.name);
      setTeamNo(form.teamNo);
      
      router.push('/home');

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
            title='Team Number'
            value={form.teamNo}
            handleChangeText={(e) => setForm({ ...form, teamNo: e })}
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
