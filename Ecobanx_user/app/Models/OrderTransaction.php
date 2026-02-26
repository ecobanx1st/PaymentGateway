<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTransaction extends Model
{
    public static function CreateTransaction($uid,$cmd=null,$txn_id,$currency1,$currency2,$amount1,$amount2,$subtotal,$shipping=0,$item_amount=0.0,$item_name,$item_desc=null,$ipn_url=null,$quantity=1,$item_number=null,$invoice,$custom,$on1=null,$ov1=null,$on2=null,$ov2=null,$extra=null,$secret,$address=null,$received_amount=0,$received_confirms=0)
    {
    	$order              = new OrderTransaction();
        $order->uid         = $uid;
        $order->cmd         = $cmd;
        $order->txn_id      = $txn_id;
        $order->currency1   = $currency1;
        $order->currency2   = $currency2;
        $order->amount1     = $amount1;
        $order->amount2     = $amount2;
        $order->subtotal    = $subtotal;
        $order->shipping    = $shipping;
        $order->item_amount = $amount1;
        $order->item_name   = $item_name;
        $order->item_desc   = $item_desc;
        $order->ipn_url     = $ipn_url;
        $order->quantity    = $quantity;
        $order->item_number = $item_number;
        $order->invoice     = $invoice;
        $order->custom     	= $custom;
        $order->on1     	= $on1;
        $order->ov1     	= $ov1;
        $order->on2     	= $on2;
        $order->ov2     	= $ov2;
        $order->extra     	= $extra;
        $order->payment_address = $address;
        $order->secret      = $secret;
        $order->received_amount   = $received_amount;
        $order->received_confirms = $received_confirms;
        $order->status = $received_confirms;
        $order->status_text = 'Waiting for buyer funds';
        $order->order_count = 0;
        $order->created_at 	= date('Y-m-d H:i:s',time());
        $order->updated_at 	= date('Y-m-d H:i:s',time());
    	$order->save();     	
    	return $order;
    }

    public static function getOneData($uid,$txid){
        $data  = OrderTransaction::where(['uid' => $uid,'txn_id' => $txid ])->first();
        if($data){
            return $data;
        }else{
            return 'No records found';
        }        
    }
    public static function listView($uid,$limit,$offset)
    {
        $list = OrderTransaction::where(['uid' => $uid])->orderBy('id', 'desc')->offset($offset)->limit($limit)->get();       
        return $list;
    }
    

    public function BuyerInformation() 
    {
        return $this->belongsTo('App\Models\BuyerInformation', 'id', 'oid');
    }
    public function ShippingInformation() 
    {
        return $this->belongsTo('App\ShippingInformation', 'id', 'oid');
    }

    public static function OrderUpdateTrans($oid){
        $order = OrderTransaction::where(['txn_id' => $oid])->first();
        $order->status = 1;
        $order->status_text = 'We have confirmed coin reception from the buyer';
        $order->updated_at    = date('Y-m-d H:i:s',time());
        $order->save();
        return $order;
    }

      public static function ApiCreateTransaction($uid,$txn_id,$currency1,$currency2,$amount1,$amount2,$subtotal,$shipping=0,$item_amount=0.0,$item_name=null,$item_desc=null,$ipn_url=null,$quantity=1,$item_number=null,$invoice,$custom,$on1=null,$ov1=null,$on2=null,$ov2=null,$extra=null,$secret,$address=null,$received_amount=0,$received_confirms=0)
    {
        $order              = new OrderTransaction();
        $order->uid         = $uid;
        $order->txn_id      = $txn_id;
        $order->currency1   = $currency1;
        $order->currency2   = $currency2;
        $order->amount1     = $amount1;
        $order->amount2     = $amount2;
        $order->subtotal    = $subtotal;
        $order->shipping    = $shipping;
        $order->item_amount = $amount1;
        $order->item_name   = $item_name;
        $order->item_desc   = $item_desc;
        $order->ipn_url     = $ipn_url;
        $order->quantity    = $quantity;
        $order->item_number = $item_number;
        $order->invoice     = $invoice;
        $order->custom      = $custom;
        $order->on1         = $on1;
        $order->ov1         = $ov1;
        $order->on2         = $on2;
        $order->ov2         = $ov2;
        $order->extra       = $extra;
        $order->payment_address = $address;
        $order->secret      = $secret;
        $order->received_amount   = $received_amount;
        $order->received_confirms = $received_confirms;
        $order->status = $received_confirms;
        $order->status_text = 'Waiting for buyer funds';
        $order->order_count = 0;
        $order->created_at  = date('Y-m-d H:i:s',time());
        $order->updated_at  = date('Y-m-d H:i:s',time());
        $order->save();         
        return $order;
    }
}
