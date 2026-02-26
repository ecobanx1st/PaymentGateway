<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ipnhistory extends Model
{
    protected $table ='ipn_history';

	public static function Insert($uid,$oid,$txn_id,$status,$ipn_url,$msg=null){
		$ipn = Ipnhistory::where(['uid' => $uid ,'txn_id' => $txn_id])->first();
		if($ipn){
			$ipn->status 		= $status;
			$ipn->ipn_url 		= $ipn_url;
			$ipn->retrun_msg 	= $msg;
			$ipn->updated_at	= date('Y-m-d H:i:s',time());
			$ipn->save();
			return $ipn;
		}else{
			$ipn = new Ipnhistory();
			$ipn->uid 			= $uid;
			$ipn->orderid 		= $oid;
			$ipn->type 			= 'Simple';
			$ipn->txn_id 		= $txn_id;
			$ipn->status 		= $status;
			$ipn->ipn_url 		= $ipn_url;
			$ipn->retrun_msg 	= $msg;
			$ipn->created_at	= date('Y-m-d H:i:s',time());
			$ipn->updated_at	= date('Y-m-d H:i:s',time());
			$ipn->save();
			return $ipn;
		}    	
    }

    public static function Update_ipn($updateid,$uid,$txn_id,$status,$ipn_url,$msg=null){
		$update = Ipnhistory::where(['uid'=> $uid,'orderid'=> $updateid])->first();
		if(!$update){   
			$update = new Ipnhistory();
			$update->type     	= 'Simple';
			$update->orderid  	= $updateid;
			$update->uid      	= $uid;
			$update->txn_id   	= $txn_id;
			$update->status   	= $status;
			$update->ipn_url  	= $ipn_url;
			$update->created_at = date('Y-m-d H:i:s',time());
			$update->updated_at = date('Y-m-d H:i:s',time());
		}
		$update->status 	= $status;
		$update->ipn_url 	= $ipn_url;
		$update->retrun_msg = $msg;
		$update->updated_at	= date('Y-m-d H:i:s',time());
		$update->save();
		return $update;
    }
}
