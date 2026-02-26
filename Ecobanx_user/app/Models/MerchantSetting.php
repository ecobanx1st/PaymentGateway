<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantSetting extends Model
{

    protected $table ='merchant_setting';
    
    public static function GetData($uid){
    	$data = MerchantSetting::where(['uid' => $uid])->first();    
    	return $data;    	
    }

   public static function UpdateMerchant($uid, $request)
    {

        if(!empty($request->receive_mail)){
            $receive_mail = implode(',', $request->receive_mail);
        } else {
            $receive_mail = $request->receive_mail;
        }

        $merchant = MerchantSetting::where('uid',$uid)->first();
        if($merchant) {
            $merchant->ipn_secret = $request->ipn_secret;
            $merchant->ipn_url = $request->ipn_url;
            $merchant->coin = $request->coin;
            $merchant->receive_mail = $receive_mail;
            $merchant->status_email = $request->status;
            $merchant->updated_at = date('Y-m-d H:i:s',time());
            
        }else{
            $merchant = new MerchantSetting();
            $merchant->uid = $uid;
            $merchant->ipn_secret = $request->ipn_secret;
            $merchant->ipn_url = $request->ipn_url;
            $merchant->coin = $request->coin;
            $merchant->receive_mail = $receive_mail;
            $merchant->status_email = $request->status;
            $merchant->created_at = date('Y-m-d H:i:s',time());
            $merchant->updated_at = date('Y-m-d H:i:s',time());
        }
        return $merchant->save();

    }


}
