<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    
	 public function userprofileCountry() {
        return $this->belongsTo('App\Models\Userprofile', 'country', 'id');
    }
     
}
