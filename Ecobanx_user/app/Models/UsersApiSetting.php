<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersApiSetting extends Model
{

    protected $table="users_api_setting";

    public static function CreateAPISettings($aid,$uid){
        $data = new UsersApiSetting();
        $data->api_id       = $aid;
        $data->uid          = $uid;
        $data->key_name     = '';
        $data->api_ip       = '';
        $data->balance      = 0;
        $data->transaction  = 0;
        $data->deposit_history  = 0;
        $data->withdraw_history  = 0;
        $data->withdraw     = 0;
        $data->created_at   = date('Y-m-d H:i:s',time());
        $data->updated_at   = date('Y-m-d H:i:s',time());
        $data->save();
        return $data;
    }

     public static function UpdateSetting($aid,$uid,$keyname=null,$ip=null){       
        $data = UsersApiSetting::where(['api_id' => $aid,'uid' => $uid])->first();
        if($data){
            $data->key_name  = $keyname;
            $data->api_ip  = $ip;
            $data->updated_at = date('Y-m-d H:i:s',time());
            $data->save();
            return $data;
        }else{
            return false;
        }
    }

      public static function empty_setting($apiid){       
        $data = UsersApiSetting::where(['api_id' => $apiid,'uid' => \Auth::user()->id])->first();
        $data->key_name  = NULL;
        $data->api_ip  = NULL;
        $data->updated_at = date('Y-m-d H:i:s',time());
        $data->save();
        return $data;
    }

     public static function Permissionupdate($aid,$uid,$basicinfo=0,$balance=0,$convert_coins=0,$deposit=0,$transaction=0,$deposit_history=0,$withdraw_history=0,$withdraw=0){
        $data = UsersApiSetting::where(['api_id' => $aid,'uid' => $uid])->first();
        $data->basicinfo  = $basicinfo;
        $data->balance  = $balance;
        $data->convert_coins  = $convert_coins;
        $data->deposit  = $deposit;
        $data->transaction  = $transaction;
        $data->deposit_history  = $deposit_history;
        $data->withdraw_history  = $withdraw_history;
        $data->withdraw  = $withdraw;
        $data->updated_at = date('Y-m-d H:i:s',time());
        $data->save();
        return $data;
    }

    public static function empty_permission($apiid){       
        $data = UsersApiSetting::where(['api_id' => $apiid,'uid' => \Auth::user()->id])->first();
        $data->balance  = 0;
        $data->transaction  = 0;
        $data->deposit_history  = 0;
        $data->withdraw_history  = 0;
        $data->withdraw  = 0;
        $data->updated_at = date('Y-m-d H:i:s',time());
        $data->save();
        return $data;
    }

     public static function getData($apiid,$uid){
        $data  = UsersApiSetting::where(['api_id'=>$apoid,'uid' => $uid])->first();
        if($data){
            return $data;
        }else{
            return false;
        }        
    }

}
