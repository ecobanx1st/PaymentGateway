<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMerchant extends Model
{

    public static function create($uid,$merchant){
    	$data = new UserMerchant();
    	$data->uid = $uid;
    	$data->merchant_id = $merchant;
    	$data->status = 1;
    	$data->created_at = date('Y-m-d H:i:s',time());
    	$data->updated_at = date('Y-m-d H:i:s',time());
    	$data->save();
    	return $data;
    }

    public static function getmerchant($uid){
    	$data  = UserMerchant::where('uid',$uid)->value('merchant_id');
    	return $data;
    }

    public static function getData($mid){
        $data  = UserMerchant::where('merchant_id',$mid)->first();
        if($data){
            return $data;
        }else{
            return false;
        }        
    }
    public function userdetails() 
    {
        return $this->belongsTo('App\User', 'uid', 'id');
    }
    public function useraddress() 
    {
        return $this->belongsTo('App\Models\UsersWallet', 'uid', 'uid');
    }
    public function userprofile() 
    {
        return $this->belongsTo('App\Models\UsersProfile', 'uid', 'user_id');
    }
}
