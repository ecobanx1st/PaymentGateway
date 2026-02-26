<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersApi extends Model
{
  protected $connection = 'mysql2';
    protected $table = 'users_apis';
}
