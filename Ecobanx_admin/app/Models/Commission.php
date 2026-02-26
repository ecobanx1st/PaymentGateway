<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $connection = 'mysql2';
    
    public static function index()
    {
    	$commission = Commission::on('mysql2')->paginate(10);

    	return $commission;
    }

    public static function coindetails($coin)
    {
        $commission = Commission::on('mysql2')->where('source', $coin)->first();
        return $commission;
    }

    public static function edit($id)
    {
    	$commission = Commission::on('mysql2')->where('id', $id)->first();

    	return $commission;
    }

    public static function commissionUpdate($request)
    {
    	$commission = Commission::on('mysql2')->where('id', $request->id)->where('source',$request->currency)->first();
    	$commission->id        = $request->id; 
        $commission->limit  = $request->limit;
        $commission->min_amount = $request->minamount; 
        $commission->max_amount = $request->maxamount;
        //$commission->autowithdraw = $request->autowithdraw;
        $commission->withdraw = $request->withdraw;
        $commission->type = $request->type;
        $commission->tradecom = $request->tradecom;
        $commission->netfee = $request->netfee;
        $commission->card_com = $request->card_com;
        $commission->point_value = $request->pointvalue;
        $commission->url = $request->url;
        $commission->contractaddress = isset($request->contractaddress) && $request->contractaddress!='' ?$request->contractaddress : NULL;
        
        $commission->save();

        return true;   
    }

    public static function coinDecimal($coin){
        $commission = Commission::on('mysql2')->where('source', $coin)->value('point_value');
        return $commission;
    }
}
