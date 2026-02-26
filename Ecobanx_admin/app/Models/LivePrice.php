<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class LivePrice extends Model
{
	protected $table = 'live_prices';    
    protected $connection = 'mysql2';

    public static function liveprice($symbol){
        $data = LivePrice::where('tcoin', $symbol)->value('price');
        if($data){
            return $data;
        }else{
            return 1;
        }
    }

    public static function getliveData($symbol){
        $data = LivePrice::where('tcoin', $symbol)->first();
        if($data){
            return $data;
        }else{
            return false;
        }
    }
}
