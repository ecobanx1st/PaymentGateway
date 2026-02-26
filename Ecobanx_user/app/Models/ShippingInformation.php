<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingInformation extends Model
{
    public static function CreateShipping($oid,$address1,$address2='',$city,$state,$zip,$country_name,$phone){
    	$data  = new ShippingInformation();
    	$data->oid = $oid;
    	$data->address1 = $address1;
    	$data->address2 = $address2;
    	$data->city = $city;
    	$data->state = $state;
    	$data->zip = $zip;
    	$data->country_name = $country_name;
    	$data->phone = $phone;
    	$data->created_at = date('Y-m-d H:i:s',time());
    	$data->updated_at = date('Y-m-d H:i:s',time());
    	$data->save();
    }
}
