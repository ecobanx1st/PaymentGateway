<?php

namespace App\Models;
use App\Models\UsersWallet;

use Illuminate\Database\Eloquent\Model;

class LivePrice extends Model
{
    public static function UpdatePrice($fcoin,$tcoin,$price)
    {
    	$list = LivePrice::where(['fcoin' => $fcoin ,'tcoin' => $tcoin])->first();
    	if($list){
    		$list->price = $price;
    		$list->updated_at = date('Y-m-d H:i:s',time());    		
    	}else{
    		$list = new LivePrice();
    		$list->fcoin = $fcoin;
    		$list->tcoin = $tcoin;
    		$list->price = $price;
    		$list->created_at = date('Y-m-d H:i:s',time());
    		$list->updated_at = date('Y-m-d H:i:s',time());
    	}
    	$list->save();     	
    	return $list;
    }

    public static function usersBalance($coin,$uid){
        $balance = UsersWallet::GetUserBalance($uid,$coin);
        $lists = LivePrice::where(['fcoin' => $coin])->get();
        $data = array();
        $data[$coin] = $balance;
        foreach ($lists as $list) {
            $coin_price = $list->price;
            $coin_coiname = $list->tcoin;
            $data[$coin_coiname] = ncmul($coin_price,$balance);
        }

        return $data;
    }

    public static function GetLivePrice($fcoin,$tcoin){
        $data = LivePrice::where(['fcoin' => $fcoin ,'tcoin' => $tcoin])->value('price');
        return $data;
    }
}
