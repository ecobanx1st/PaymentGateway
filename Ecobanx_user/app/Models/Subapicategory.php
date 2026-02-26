<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subapicategory extends Model
{
    protected $table ='sub_merchant_api';


    public static function index()
    {
        $forum = Subapicategory::get();

        return $forum;
    }

  }
