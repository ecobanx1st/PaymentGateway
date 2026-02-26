<?php
namespace App\Models;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UsersApi extends Authenticatable
{

    use HasApiTokens, Notifiable;

    protected $guard ="userapi";

     protected $fillable = [
        'user_id', 'public_key', 'private_key'
    ];

    public static function create($uid,$pub,$pvt){    	
    	$data = new UsersApi();
    	$data->user_id 		= $uid;
    	$data->public_key 	= $pub;
    	$data->private_key 	= $pvt;
    	$data->created_at = date('Y-m-d H:i:s',time());
    	$data->updated_at = date('Y-m-d H:i:s',time());
    	$data->save();
    	return $data;
    }
	
	public function apidetails() {
        return $this->belongsTo('App\Models\UsersApiSetting', 'id', 'api_id');
    }
}
