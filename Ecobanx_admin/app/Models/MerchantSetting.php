<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantSetting extends Model
{
    protected $connection = 'mysql2';
    protected $table ='merchant_setting';

    public static function GetData($uid){
    	$data = MerchantSetting::where(['uid' => $uid])->first();
    
    	return $data;
    	
    }



}
