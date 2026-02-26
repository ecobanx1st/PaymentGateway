<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tickets extends Model
{	

	    protected $connection = 'mysql2';
    protected $table = 'supporttickets';

    public static function index()
    {
    	$tickets = Tickets::on('mysql2')
    	->join('users', 'supporttickets.uid', '=', 'users.id')
    	->select('supporttickets.*','users.name')
    	->orderBy('id','desc')->paginate(10);
    	return $tickets;
    }
}
