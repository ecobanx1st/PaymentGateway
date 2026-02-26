<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuyerInformation extends Model
{
    protected $table = 'buyer_informations';
    public static function CreateBuyer($oid,$first_name,$last_name,$company=null,$email){
    	$data = new BuyerInformation();
    	$data->oid 			= $oid;
    	$data->first_name 	= $first_name;
    	$data->last_name 	= $last_name;
    	$data->company 		= $company;
    	$data->email	 	= $email;
    	$data->created_at	= date('Y-m-d H:i:s',time());
    	$data->updated_at	= date('Y-m-d H:i:s',time());
    	$data->save();
    	return $data;
    }
 
}
