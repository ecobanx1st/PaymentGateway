<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\User;

class Kyc extends Model
{
    protected $table = 'kyc'; 
    public function user() {
        return $this->belongsTo('App\User', 'user_id', 'id');
    }

    public static function kycinsert($request,$front_img,$back_img){

			$kyc = new Kyc;
			$kyc->uid = \Auth::user()->id;
			$kyc->fname = $request->input('first_name');
			$kyc->lname = $request->input('last_name');
			$kyc->dob = date('Y-m-d', strtotime($request->input('dob')));
			$kyc->city = $request->input('city');
			$kyc->id_document = $request->input('id_document');
			$kyc->country = $request->input('country');
			$kyc->id_type = $request->input('id_type');
			$kyc->id_number = $request->input('id_number');
			$kyc->id_exp = date('Y-m-d', strtotime($request->input('id_exp')));
			$kyc->front_img = url($front_img);
			$kyc->back_img =  url($back_img);
			$kyc->status = 0; 
			$kyc->save();

			User::where(['id' => $kyc->uid])->update(['kyc_verify' => 2]);

			return true;
    }

}
