<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Models\Commission;

class UserCommission extends Model {

    protected $table = 'user_commissions';
    protected $connection = 'mysql2';

    public static function index($uid) {
        $commission = UserCommission::on('mysql2')->where('uid', $uid)->paginate(10);
        return $commission;
    }

    public static function coindetails($coin) {
        $commission = UserCommission::on('mysql2')->where('source', $coin)->first();
        return $commission;
    }

    public static function edit($id) {
        $commission = UserCommission::on('mysql2')->where('id', $id)->first();
        return $commission;
    }

    public static function commissionUpdate($request) {
        //dd($request);
        $commission = UserCommission::on('mysql2')->where('id', $request->id)->where('source',$request->currency)->where('uid',$request->uid)->first();
        if($commission){
        $commission->id        = $request->id; 
        $commission->limit  = $request->limit;
        $commission->min_amount = $request->minamount; 
        $commission->max_amount = $request->maxamount;
        $commission->withdraw = $request->withdraw;
        $commission->type = $request->type;
        $commission->tradecom = $request->tradecom;
        $commission->netfee = $request->netfee;
        $commission->card_com = $request->card_com;
        $commission->point_value = $request->pointvalue;
        $commission->url = $request->url;
        $commission->save();
        }
        return true;   
    }

    public static function coinDecimal($coin){
        $commission = UserCommission::on('mysql2')->where('source', $coin)->value('point_value');
        return $commission;
    }

    public static function createComm($uid) {
        $order_items = Commission::get()->toArray();
        foreach ($order_items as $item) {
            $array = array('uid'=>$uid);
            $arraydata = array_merge($array, $item);
            unset($arraydata["id"]); 
            UserCommission::insert($arraydata);
        }
        return true;
    }

}