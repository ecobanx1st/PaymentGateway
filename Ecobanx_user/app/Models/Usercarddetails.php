<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usercarddetails extends Model
{
	protected $table = 'usercarddetails';

       protected $fillable = [
        'uid', 'currency', 'card_type','card_number','card_holdername','card_bankname'
    	];
}
