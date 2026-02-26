<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLogin extends Model
{
	protected $table = 'user_login'; 
	protected $fillable = ['user_id','login_ip','status','location']; 

	public static function attemptSave($data)
	{
		UserLogin::create($data);
		return true;
	}

	public static function attemptUpdate($data)
	{
		UserLogin::create($data);
		return true;
	}
	
	public static function isLogged($uid,$ip,$location){
        $user = UserLogin::where(['user_id' => $uid,'login_ip' =>$ip])->first();
        if(!$user){
        	$user = new UserLogin();
        	$user->user_id = $uid;
        	$user->login_ip = $ip;
        	$user->created_at = date('Y-m-d H:i:s',time());
        }
        $user->location = $location;
        $user->status = 1;
        $user->updated_at = date('Y-m-d H:i:s',time());
        $user->save();
        return true;
    } 

    public static function islogout($uid,$ip1){
    	UserLogin::where(['user_id'=> $uid,'login_ip' => $ip1])->update(['status' => 0,'updated_at' => date('Y-m-d H:i:s')]);
    	return true;
    }
}