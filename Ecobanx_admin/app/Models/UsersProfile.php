<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersProfile extends Model
{  

   protected $connection = 'mysql2';
    protected $table = 'users_profiles';


      public static function getData($uid){
        
        $data  = UsersProfile::where('user_id',$uid)->first();
        return $data;
              
    }

}
