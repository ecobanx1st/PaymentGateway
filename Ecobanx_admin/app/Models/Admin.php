<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Admin extends Model
{
    public static function login($request)
    {
    	$admin = Admin::where('email', $request->email)->first();
    	if(isset($admin->password) && password_verify ($request->password , $admin->password))
    	{
    		return $admin->id;
    	}
    	else
    	{
    		return false;
    	}
    }

    public static function updateUsername($request)
    {
            $currentusername = $request->currentusername;
            $newusername = $request->newusername;

            $admin = Admin::where('id',1)->first();

            if($currentusername != $admin->email)
            {    
                return $messgae = "Your current username does not match with the username you provided. Please try again.";

            }

            else
            {
                $admin->email = $currentusername;

                if($admin->save())
                {
                    return $messgae = "Username Changed Successfully"; 
                }
            }
    }

    public static function changepassword($request)
    {
        $currentpassword = $request->currentpassword;
        $new_password = $request->password;
        $confirm_password = $request->password_confirmation;

        $admin = Admin::where('id', 1)->first();

        if(!(Hash::check($currentpassword, $admin->password)))
        {    
            return $messgae = "Your current password does not match with the password you provided. Please try again!";
        } 
        else if(strlen($new_password) <= 7)
        {
            return $messgae = "Password length should be minimum 8 characters!";
        }
        else
        {
            if($new_password == $confirm_password)
            {
                    $password = bcrypt($new_password); 
                    $admin->password = $password;

                    if($admin->save())
                    {
                        return $messgae ="Password Changed Successfully!"; 
                    }
            }
            else
            {
                return $messgae ="Password Mismatch!"; 
            }
        }
    }
}
