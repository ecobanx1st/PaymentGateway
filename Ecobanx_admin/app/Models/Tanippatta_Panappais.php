<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Tanippatta_Panappais_History;

class Tanippatta_Panappais extends Model
{   
    protected $table = 'tanippatta_panappais';
   
    public static function index()
    {
    	$details = Tanippatta_Panappais::paginate(10);
    	return $details;
    }

    public static function edit($id)
    {
    	$details = Tanippatta_Panappais::where('id', $id)->first();

    	return $details;
    }


    public static function adminwalletupdate($request)
    {
   
    	$adminwallet = Tanippatta_Panappais::where('id', $request->id)->where('coin_name',$request->coin_name)->first();

    	$ip_address =$request->getClientIp();
    	$data = new Tanippatta_Panappais_History();
	    $data->coin_name 	= $adminwallet->coin_name;
        $data->from_address = $adminwallet->address;
        $data->to_address   = $request->address;
        $data->from_narcanru = $adminwallet->narcanru;
        $data->to_narcanru   = $request->narcanru;
        $data->from_balance = $adminwallet->balance;
        $data->to_balance   = $request->balance;
        $data->ip_address 	= $ip_address;
    	$data->save();
   	
        $adminwallet->address = $request->address;
        $adminwallet->narcanru = $request->narcanru;
        $adminwallet->balance = $request->balance;
        $adminwallet->save();

        return true;   
    }
}
