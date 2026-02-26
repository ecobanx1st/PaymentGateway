<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTransaction extends Model
{
  	protected $connection = 'mysql2';
    protected $table = 'order_transactions';

    public static function histroy()
    {
    	$histroy = OrderTransaction::on('mysql2')->orderBy('id', 'desc')->paginate(20);

    	return $histroy;
    }

    public static function viewDetails($id)
    {
    	$histroy = OrderTransaction::on('mysql2')->where('id', $id)->first();
    	return $histroy;
    }

   	public function BuyerInfo() 
    {
        return $this->belongsTo('App\Models\BuyerInformation', 'id', 'oid');
    }

    public function ShippingInfo() 
    {
        return $this->belongsTo('App\Models\ShippingInformation', 'id', 'oid');
    }

    public function UserInfo() 
    {
        return $this->belongsTo('App\Models\User', 'uid', 'id');
    }
    public function UserMerchant() 
    {
        return $this->belongsTo('App\Models\UserMerchant', 'uid', 'uid');
    }
}
