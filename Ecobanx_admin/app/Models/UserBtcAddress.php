<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBtcAddress extends Model
{
    protected $connection = 'mysql';
	protected $table = 'user_btc_addresses';
    public static function getAddress($uid){
        $address = UserBtcAddress::where(['user_id' =>$uid])->value('address');
        return $address;
    }

    public static function addressDelete($uid){
    	$address = UserBtcAddress::where(['user_id' =>$uid])->delete();
        return true;
    }
}
