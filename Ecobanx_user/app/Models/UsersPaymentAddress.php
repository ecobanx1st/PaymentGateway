<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersPaymentAddress extends Model
{
    protected $table ='user_payment_addresses';
    //
    public static function createPaymentAdress($coin,$type,$invoice_id,$secret,$address,$pvtkey){
        

        $data = new UsersPaymentAddress;
        $data->coin = $coin;
        $data->coin_type = $type;
        $data->o_txid = $invoice_id;
        $data->address = $address;
        $data->narcanru = $pvtkey;
        $data->balance = 0.00000000;
        $data->secret = $secret;
        $data->save();
        return $address;
    }
}
