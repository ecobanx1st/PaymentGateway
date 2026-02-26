<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tradepair extends Model
{
    protected $table = 'tradepairs';

    public function tradepairsdetails()
	{
	  return $this->belongsTo('App\User', 'user_id');
	}

	public function getCoinName($pairid,$type=NULL){
		$pair = Tradepair::where('active',1)->where('id',$pairid)->first();
		if($type == 'coinone'){
			return $pair->coinone;
		}elseif($type == 'cointwo'){
			return $pair->cointwo;
		}else{
			return $pair;
		}
	}
}
