<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersProfile extends Model
{
        protected $fillable = [
        'user_id', 'display_name', 'profileimg','optional_mail','gender'
    ];

     public static function UpdateAccount($uid, $request)
    {

        
        $data = UsersProfile::where('user_id',$uid)->first();
        if($data) {
           
            $data->gender = $request->sex;
            if(isset($request->optional_email)){
            $data->optional_mail = $request->optional_email;}
            else{
            $data->optional_mail = 0;}
            $data->updated_at = date('Y-m-d H:i:s',time());
            $data->updated_at = date('Y-m-d H:i:s',time());
            
        }else{

            $data = new UsersProfile();
            $data->user_id = $uid;
            $data->gender = $request->sex;
            if(isset($request->optional_email)){
            $data->optional_mail = $request->optional_email;}
            else{
            $data->optional_mail = 0;}
            $data->created_at = date('Y-m-d H:i:s',time());
            $data->updated_at = date('Y-m-d H:i:s',time());
           
        }
        return $data->save();

    }

      public static function getData($uid){
        $data  = UsersProfile::where('user_id',$uid)->first();
        if($data){
            return $data;
        }else{
            return false;
        }        
    }

}
