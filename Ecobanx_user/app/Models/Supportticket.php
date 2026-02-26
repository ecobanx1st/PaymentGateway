<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supportticket extends Model
{
    protected $fillable = [
    	'uid', 'ticket_id','subject','message','status'
    ];

}
