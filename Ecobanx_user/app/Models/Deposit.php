<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    protected $table = "deposits";

    public static function listView($uid,$coin)
    {
    	$list = Deposit::where(['uid' => $uid, 'currency' => $coin])->orderBy('id', 'desc')->paginate(15);     	
    	return $list;
    }
    public static function orderCancel($id,$uid)
    {
    	$deposit = Deposit::where(['id' => $id,'uid' => $uid,'status'=> 0])->first();
    	if(is_object($deposit))
        {
        	$deposit->status = 3;
        	$deposit->save();   
        	return true;         
        }else{
            return false;
        }
    }
}
