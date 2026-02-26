<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCommission extends Model
{
    protected $table = 'user_commissions';

    public static function index()
    {
    	$commission = UserCommission::where('status',1)->get();
    	return $commission;
    }

    public static function coindetails($coin,$uid)
    {
        $commission = UserCommission::where('status',1)->where('source', $coin)->where('uid', $uid)->first();
        return $commission;
    }
}
