<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    public static function index()
    {
    	$commission = Commission::where('status',1)->get();
    	return $commission;
    }

    public static function coindetails($coin)
    {
        $commission = Commission::where('status',1)->where('source', $coin)->first();
        return $commission;
    }
}
