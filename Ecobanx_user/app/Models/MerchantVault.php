<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantVault extends Model
{
    protected $table="merchant_vaults";

    public static function CreateMercantVault($uid,$vid,$asset_id,$address){
        $data = new MerchantVault();
        $data->user_id       = $uid;
        $data->vault_id      = $vid;
        $data->asset_id     = $asset_id;
        $data->address       = $address;
        $data->status      = 0;
        $data->created_at   = date('Y-m-d H:i:s',time());
        $data->updated_at   = date('Y-m-d H:i:s',time());
        $data->save();
        return $data;
    }
}
