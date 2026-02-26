<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockAddress extends Model
{
   public static function create_address($index,$address,$secret,$callbackurl){
   		$data = new BlockAddress();
   		$data->bid 			  = $index;
   		$data->address 		= $address;
      $data->secret     = $secret;
   		$data->callback 	= $callbackurl;
      $data->status     = 0;
   		$data->created_at	= date('Y-m-d H:i:s',time());
    	$data->updated_at	= date('Y-m-d H:i:s',time());
    	$data->save();
    	return $data;
   }
}
