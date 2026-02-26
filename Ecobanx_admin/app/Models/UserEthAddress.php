<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEthAddress extends Model
{
    public static function getAddress($uid){
        $address = UserEthAddress::where(['user_id' =>$uid])->value('address');
        return $address;
    }
    
    public static function addressDelete($uid){
    	$address = UserEthAddress::where(['user_id' =>$uid])->delete();
        return true;
    }
}
